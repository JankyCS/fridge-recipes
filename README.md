# BROKEN FOR NOW
The API used to retrieve recipe information is down. I will replace it with some other recipe API at some point but for now Fridge Recipes is broken

# Welcome to Fridge Recipes!
Fridge recipes is a modern day fridge-management, recipe-discovery tool to help users get inspired in the kitchen. Try it out [here](https://arcane-beach-51469.herokuapp.com)!

## How To Use 
After registering on the website, users are prompted to add items to their "fridge". These can be any food-items/ingredients found in the user's kitchen - they don't necessarily need to be refrigerated!
![Edit Fridge Contents](https://i.ibb.co/tCj9tv4/editfridge.png)

Then, the user is presented with several recipes, relevant to the ingredients they currently have at home. Rather than finding a recipe and going to the store to buy the required ingredients, this tool allows users to find recipes based on what they already have, thus saving money and decreasing food waste.

![Recipes](https://i.ibb.co/XyxJkGg/recipes.png)

## How It Works/Technologies Used
This project is built with **NodeJS**, and its most popular web framework, **ExpressJS.** The web-app uses **Mongoose** to model data, and stores user information (username, pass, fridge contents) on a **MongoDB Atlas** database.

User passwords are secured/encrypted with **bpcrytJS**, and authentication is facilitated with the **PassportJS** middleware.

The front-end of this project uses the **Pug** templating engine to render webpages in Express, and also uses **Bootstrap** CSS framework.

The recipes are obtained with the [Recipe Puppy API](http://www.recipepuppy.com/about/api/)
