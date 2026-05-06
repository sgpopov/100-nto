import { test, expect } from "@playwright/test";

test.describe("Sites view navigation", () => {
  test("clicking Карта on list page navigates to /sites/map", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Карта" }).click();
    await expect(page).toHaveURL(/\/sites\/map/);
  });

  test("clicking Списък on map page navigates back to /sites/list", async ({ page }) => {
    await page.goto("/sites/map");
    await page.getByRole("link", { name: "Списък" }).click();
    await expect(page).not.toHaveURL(/\/sites\/map/);
    expect(new URL(page.url()).pathname).toBe("/sites/list");
  });

  test("active filter state is preserved in URL when switching views", async ({
    page,
  }) => {
    await page.goto(
      "/sites/list?filters[location]=%D0%91%D0%B0%D0%BD%D1%81%D0%BA%D0%BE&filters[visited]=visited"
    );

    await page.getByRole("link", { name: "Карта" }).click();

    await expect(page).toHaveURL(/\/sites\/map/);
    await expect(page).toHaveURL(/filters\[location\]=%D0%91%D0%B0%D0%BD%D1%81%D0%BA%D0%BE/);
    await expect(page).toHaveURL(/filters\[visited\]=visited/);
  });

  test("nav link is active on /sites/list", async ({ page }) => {
    await page.goto("/sites/list");
    const link = page.getByRole("link", { name: "Обекти" });
    await expect(link).toHaveClass(/border-indigo-500/);
  });

  test("nav link is active on /sites/map", async ({ page }) => {
    await page.goto("/sites/map");
    const link = page.getByRole("link", { name: "Обекти" });
    await expect(link).toHaveClass(/border-indigo-500/);
  });

  test("applying a city filter on map page reduces the displayed pins", async ({
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

    await page.getByPlaceholder("Търсене...").click();
    await page
      .locator('[data-slot="combobox-item"]')
      .filter({ hasText: /^Банско$/ })
      .click();

    await expect(page).toHaveURL(/filters\[location\]=%D0%91%D0%B0%D0%BD%D1%81%D0%BA%D0%BE/);
    await expect(page.locator(".leaflet-marker-icon").first()).toBeVisible({
      timeout: 5000,
    });

    const filteredPinsCount = await page.locator(".leaflet-marker-icon").count();
    expect(filteredPinsCount).toBeLessThan(totalPinsCount);
  });
});

test.describe("Location combobox (Град filter on sites)", () => {
  test("opening the combobox shows region groups with their cities", async ({
    page,
  }) => {
    await page.goto("/sites/list");

    await page.getByPlaceholder("Търсене...").click();

    await expect(
      page.locator('[data-slot="combobox-item"]').filter({ hasText: /^Всички$/ }),
    ).toBeVisible();
    await expect(
      page.locator('[data-slot="combobox-item"]').filter({ hasText: /^Благоевградска област$/ }),
    ).toBeVisible();
    // city nested under the region
    await expect(
      page.locator('[data-slot="combobox-item"]').filter({ hasText: /^Банско$/ }),
    ).toBeVisible();
  });

  test("typing in the combobox narrows the option list", async ({ page }) => {
    await page.goto("/sites/list");

    const input = page.getByPlaceholder("Търсене...");
    await input.click();
    await input.fill("Банско");

    await expect(
      page.locator('[data-slot="combobox-item"]').filter({ hasText: /^Банско$/ }),
    ).toBeVisible();
    await expect(
      page.locator('[data-slot="combobox-item"]').filter({ hasText: /^Всички$/ }),
    ).not.toBeVisible();
    await expect(
      page.locator('[data-slot="combobox-item"]').filter({ hasText: /^Варненска област$/ }),
    ).not.toBeVisible();
  });

  test("selecting a region updates the URL and reduces the site count", async ({
    page,
  }) => {
    await page.goto("/sites/list");

    const totalText = await page.locator(".text-sm.italic").first().innerText();

    await page.getByPlaceholder("Търсене...").click();
    await page
      .locator('[data-slot="combobox-item"]')
      .filter({ hasText: /^Благоевградска област$/ })
      .click();

    await expect(page).toHaveURL(
      /filters\[location\]=%D0%91%D0%BB%D0%B0%D0%B3%D0%BE%D0%B5%D0%B2%D0%B3%D1%80%D0%B0%D0%B4%D1%81%D0%BA%D0%B0%20%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82/,
    );
    const filteredText = await page.locator(".text-sm.italic").first().innerText();
    expect(filteredText).not.toBe(totalText);
  });

  test("selecting a specific city filters to only that city's sites", async ({
    page,
  }) => {
    await page.goto("/sites/list");

    const input = page.getByPlaceholder("Търсене...");
    await input.click();
    await input.fill("Банско");
    await page
      .locator('[data-slot="combobox-item"]')
      .filter({ hasText: /^Банско$/ })
      .click();

    await expect(page).toHaveURL(
      /filters\[location\]=%D0%91%D0%B0%D0%BD%D1%81%D0%BA%D0%BE/,
    );
    const listItems = page.locator("ul[role='list'] li, [data-testid='site-item']");
    const count = await listItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test("selecting Всички resets the location filter to show all sites", async ({
    page,
  }) => {
    await page.goto(
      "/sites/list?filters[location]=%D0%91%D0%B0%D0%BD%D1%81%D0%BA%D0%BE&filters[visited]=all",
    );

    const filteredText = await page.locator(".text-sm.italic").first().innerText();

    await page.getByPlaceholder("Търсене...").click();
    await page
      .locator('[data-slot="combobox-item"]')
      .filter({ hasText: /^Всички$/ })
      .click();

    await expect(page).toHaveURL(/filters\[location\]=all/);
    const totalText = await page.locator(".text-sm.italic").first().innerText();
    expect(totalText).not.toBe(filteredText);
  });
});
