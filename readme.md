# IFN666 Assignment 3 Mobile App - Handcraft Tutorial 

## Project Overview

This project is a mobile application developed for IFN666 Assignment 3 using React Native and Expo.

The app is a mobile version of handcraft tutorial. It allows users to browse and manage handcraft learning content, including:

- Categories
- Materials
- Tutorials

The app communicates with my deployed IFN666 API:

text https://koala04.ifn666.com/assignment2/api 

## Student Details

text Name: Ka Ki Yeung Unit: IFN666 Assessment: Assignment 3 Mobile Application 

## Technologies Used

- React Native
- Expo
- JavaScript / JSX
- npm
- Expo Go
- React Navigation
- REST API
- AsyncStorage
- Native Share API

## Core Features

The app supports:

- View categories, materials, and tutorials
- View detail pages
- Create content when authorised
- Edit content when authorised
- Delete content when authorised
- Login and logout
- Profile page showing username and logout button
- Sorting for tutorials
- Error handling for failed API requests

Edit and delete actions are only available to authorised users, based on the existing owner permission logic.

## API Integration

The app uses the deployed API:

text https://koala04.ifn666.com/assignment2/api 

API request logic is placed inside the services folder. This keeps API code separate from the screen components.

The app uses REST API operations such as:

- GET
- POST
- PUT / PATCH
- DELETE

If an API request fails, the app shows an error message instead of crashing.

## Sorting

Tutorial sorting includes:

- Name A-Z
- Name Z-A
- Difficulty: Easy to Hard
- Difficulty: Hard to Easy
- Least time spent
- Most time spent

## Additional Feature 1: Share

The first selected additional feature is Share.

Users can share Category, Material, and Tutorial information to other apps.

The shared content is dynamically generated from the selected item.

Example tutorial share format:

text Handcraft Tutorial Tutorial  Tutorial title: <title or N/A> Difficulty: <difficulty or N/A> Time: <time or N/A> Categories: <categories or N/A> Materials: <materials or N/A> 

Missing optional information is displayed as:

text N/A 

## Additional Feature 2: Gestures

The second selected additional feature is Gestures.

The app uses long-press gestures on:

- Category cards
- Material cards
- Tutorial cards

Gesture behaviour:

- Normal tap opens the detail page.
- Long-press opens quick actions such as View, Edit, Delete, and Share.

This improves usability because users can access common actions quickly from the list screen.

## User Interface Design

The app uses a simple blue and white theme.

The mobile interface includes:

- Splash screen
- Tab-based navigation
- Safe-area support
- Status bar support
- Card-based lists
- Clear buttons and readable text

## Project Structure

Example structure:

text src/   components/   screens/   services/   navigation/   context/ assets/ app.json package.json README.md 

Key folders:

- components: reusable UI components
- screens: app screens
- services: API request functions
- navigation: navigation setup
- context: shared app state such as authentication

## How to Run

Install dependencies:

bash npm install 

Start the Expo app:

bash npx expo start --clear 

If LAN mode does not work, use tunnel mode:

bash npx expo start --tunnel --clear 

Open the app using Expo Go on a mobile device.

## Testing Checklist

Before recording the demo video, test:

- App opens in Expo Go
- Splash screen appears
- Navigation works
- Category, Material, and Tutorial lists load
- Detail pages open correctly
- Login works
- Profile page shows username and logout button
- Create, edit, and delete work for authorised users
- Sorting works
- Share works for Category, Material, and Tutorial
- Long-press gestures work on Category, Material, and Tutorial cards
- App shows an error message when the API request fails

## Multi-Tenancy Discussion

The app is not currently multi-tenant, but it could be changed to support multiple organisations.

A tenant could be a school, training provider, or organisation using the same app.

The best model for this project would be a shared database with a tenantId field. Each user, category, material, and tutorial would store which tenant it belongs to.

Example:

js {   title: "React Native Basics",   difficulty: "Easy",   tenantId: "tenant001" } 

After login, the server could identify the tenant from the user’s authentication token. The backend would then only return data that matches that tenant.

For example:

js Tutorial.find({ tenantId: req.user.tenantId }); 

This prevents one tenant from viewing or modifying another tenant’s data.

This design works with one server because tenant separation is handled by software using authentication, middleware, and database filtering.

## Selected Additional Features

The two additional features selected for marking are:

1. Share
2. Gestures

Deep linking is not selected for this submission.
