describe("App Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should start on the Devices page", () => {
    cy.url().should("include", "/devices");
    cy.contains("ion-title", "Devices");
  });

  it("should navigate to the Transfers page", () => {
    cy.get('ion-tab-button[tab="transfers"]').click();
    cy.url().should("include", "/transfers");
    cy.contains("ion-title", "Transfers");
  });

  it("should navigate to the Clipboard page", () => {
    cy.get('ion-tab-button[tab="clipboard"]').click();
    cy.url().should("include", "/clipboard");
    cy.contains("ion-title", "Clipboard");
  });

  it("should navigate to the Settings page", () => {
    cy.get('ion-tab-button[tab="settings"]').click();
    cy.url().should("include", "/settings");
    cy.contains("ion-title", "Settings");
  });
});
