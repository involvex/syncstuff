# Shared workspace for UI / CSS / Theme componends

- using Tamagui 

create a new workspace for the mone repo setup / or enhance the shared package 

Implement tamagui @tamagui/core bun add @tamagui/config tamagui-loader  @tamagui/cli 

Tamagui framework for Ui / CSS / Theme components 

the shared workspace will be used to generate theme ui / css components for @/packages/app/package.json @/packages/web/package.json @/packages/app/electron/package.json @/packages/cli/package.json 

then setup up the other workspaces app / web / cli to rely on the shared space

workspace will provider css animations dark light mode 
components , color scheme , font html elements , spinner scrollview ,  cards and more 


Create a new shared workspace in the mone monorepo or enhance the existing shared package. Implement Tamagui by installing @tamagui/core, @tamagui/config, tamagui-loader, and @tamagui/cli using bun. Utilize Tamagui as the framework for UI, CSS, and theme components.

Configure the shared workspace to generate themed UI and CSS components that will be consumed by the following packages: @/packages/app/package.json, @/packages/web/package.json, @/packages/app/electron/package.json, and @/packages/cli/package.json.

Subsequently, set up the app, web, and cli workspaces to depend on and import from the shared workspace.

The shared workspace must provide: CSS animations, dark and light mode support, reusable components (including color schemes, fonts, HTML elements, spinners, scrollviews, cards, and more). Refer to @/docs/UI Workspace.md for detailed specifications and implementation guidelines.