// Getting the model and Schema object from the Mongoose package
import { model, Schema } from "mongoose";

// Making a new Schema for the recipe
const recipeSchema = new Schema({
  //Here, you need to pass in all the properties expected in the recipeSchema
  name: String,
  description: String,
  dateCreated: String,
  originated: String,
});
// to export data from this file.
module.exports = model("Recipe", recipeSchema);
