# IFN666 Assignment 3 - Handcraft Tutorial App

## How to run
- npm install
- npx expo start

## API base URL
- https://koala04.ifn666.com/assignment2/api

## Public user behaviour
- can view tutorials/categories/materials
- can open detail pages
- cannot create/edit/delete

## Logged-in user behaviour
- can create content
- can edit/delete only own content

## Deep link examples
- ifn666://tutorials
- ifn666://tutorials/PASTE_ID_HERE
- ifn666://categories/PASTE_ID_HERE
- ifn666://materials/PASTE_ID_HERE
- https://ifn666.com/tutorials/PASTE_ID_HERE

## Share feature
- detail pages generate readable dynamic share messages
- shared message includes deep link
- opening shared deep link navigates to correct screen

## Share to app note
Expo Go has limitations for arbitrary incoming files/text from other apps. This app supports “share to app” via incoming links (e.g. https://ifn666.com/tutorials/:id, /categories/:id, /materials/:id) routed by React Navigation linking.
