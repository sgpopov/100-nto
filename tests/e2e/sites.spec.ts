import { test, expect } from "@playwright/test";

test.describe("Sites view navigation", () => {
  test("clicking Карта on list page navigates to /sites/map", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Карта" }).click();
    await expect(page).toHaveURL(/\/sites\/map/);
  });

  test("clicking Списък on map page navigates back to /", async ({ page }) => {
    await page.goto("/sites/map");
    await page.getByRole("link", { name: "Списък" }).click();
    await expect(page).not.toHaveURL(/\/sites\/map/);
    expect(new URL(page.url()).pathname).toBe("/");
  });

  test("active filter state is preserved in URL when switching views", async ({
    page,
  }) => {
    await page.goto(
      "/?filters[location]=%D0%91%D0%B0%D0%BD%D1%81%D0%BA%D0%BE&filters[visited]=visited"
    );

    await page.getByRole("link", { name: "Карта" }).click();

    await expect(page).toHaveURL(/\/sites\/map/);
    await expect(page).toHaveURL(/filters\[location\]=%D0%91%D0%B0%D0%BD%D1%81%D0%BA%D0%BE/);
    await expect(page).toHaveURL(/filters\[visited\]=visited/);
  });

  test("applying a region filter on map page updates the displayed pins", async ({
    page,
  }) => {
    await page.goto("/sites/map");

    await expect(page.locator(".leaflet-container")).toBeVisible({
      timeout: 10000,
    });

    await expect(page.locator(".leaflet-marker-icon").first()).toBeVisible({
      timeout: 10000,
    });

    const totalPinsCount = await page.locator(".leaflet-marker-icon").count();

    // Open the location filter and select Банско
    await page.locator("button").filter({ hasText: /Град/ }).click();
    await page.locator('[role="menuitem"]').filter({ hasText: "Банско" }).click();

    await expect(page).toHaveURL(/filters\[location\]/);
    await expect(page.locator(".leaflet-marker-icon").first()).toBeVisible({
      timeout: 5000,
    });

    const filteredPinsCount = await page
      .locator(".leaflet-marker-icon")
      .count();

    expect(filteredPinsCount).toBeLessThan(totalPinsCount);
  });
});
