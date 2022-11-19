import * as model from "./model.js"
import { MODAL_CLOSE_SECONDS } from "./config.js"
import recipeView from "./views/recipeView.js"
import searchView from "./views/searchView.js"
import resultsView from "./views/resultView.js"
import paginationView from "./views/paginationView.js"
import bookmarksView from "./views/bookmarksView.js"
import AddRecipeView from "./views/addRecipeView"

import "core-js/stable"
import "regenerator-runtime/runtime"
import addRecipeView from "./views/addRecipeView"

/*
if(module.hot) {
  module.hot.accept()
}
*/

const controlRecipes = async function() {
  try {
     const id = window.location.hash.slice(1)

    if (!id) return

    recipeView.renderSpinner()

    // 0) Update results view
    resultsView.update(model.getSearchResultsPage())
    bookmarksView.update(model.state.bookmarks)

    // 1) Loading recipe
    await model.loadRecipe(id)


    // 2) Rendering recipe
    recipeView.render(model.state.recipe)

  } catch (err) {
    recipeView.renderError()
  }
}

const constrolSearchResults = async function() {
  try {
    resultsView.renderSpinner()
    // 1) Get search query
    const query = searchView.getQuery()
    if(!query) return 

    // 2) Load search results
    await model.loadSearchResults(query)

    // 3) Render results
    resultsView.render(model.getSearchResultsPage(1))

    // 4) Render initial pagination buttons 
    paginationView.render(model.state.search)

  } catch(err) {
    console.log(err)
  }
}

const controlPagination = function(goToPage) {
  // 3) Render results
  resultsView.render(model.getSearchResultsPage(goToPage))

  // 4) Render initial pagination buttons 
  paginationView.render(model.state.search)
}

const controlServings = function (newServings) {

  // Update the recipe servings (in state)
  model.updateServings(newServings)

  // Update 
  // recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)
}

const controlAddBookmark = function() {
  // 1) Add or remove bookmark
  if(!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe)
  } else {
    model.deleteBookmark(model.state.recipe.id)
  }
  // 2) Update recipe view
  recipeView.update(model.state.recipe)
  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function(newRecipe) {
 try {
  // Show loading spinner
  addRecipeView.renderSpinner()

  // Upload new recipe
  await model.uploadRecipe(newRecipe)
  
  // Render recipe
  recipeView.render(model.state.recipe)

  // Render success message
  addRecipeView.renderMessage()

  // Render bookmark view
  bookmarksView.render(model.state.bookmarks)

  // Change ID in the URL
  window.history.pushState(null, ``, `#${model.state.recipe.id}`)

  // Close form window
  setTimeout(function() {
    addRecipeView.toggleWindow()
  }, MODAL_CLOSE_SECONDS * 1000)
} catch(err) {
  console.error(err)
  addRecipeView.renderError(err.message)
}
}

const init = function() {
  bookmarksView.addHendlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes)
  recipeView.addHandlerUpdateSeervings(controlServings)
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSearch(constrolSearchResults)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView.addHandlerUpload(controlAddRecipe)
}
init()





