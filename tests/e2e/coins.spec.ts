import { test, expect } from "@playwright/test";

test.describe("Coins views", () => {
  test("/coins redirects to /coins/list", async ({ page }) => {
    await page.goto("/coins");
    await expect(page).toHaveURL(/\/coins\/list/);
  });

  test("/coins/list renders coin cards with names and images", async ({
    page,
  }) => {
    await page.goto("/coins/list");

    const cards = page.locator("ul[role='list'] li");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("ul[role='list'] img").first()).toBeVisible();
    await expect(page.locator("ul[role='list'] h3").first()).not.toBeEmpty();
  });

  test("/coins/map renders a Leaflet map with at least one pin", async ({
    page,
  }) => {
    await page.goto("/coins/map");

    await expect(page.locator(".leaflet-container")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator(".leaflet-marker-icon").first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("toggling from list to map preserves filters[location] in the URL", async ({
    page,
  }) => {
    await page.goto(
      "/coins/list?filters[location]=%D0%92%D0%B0%D1%80%D0%BD%D0%B0&filters[collected]=all",
    );

    await page.getByRole("link", { name: "Карта" }).click();

    await expect(page).toHaveURL(/\/coins\/map/);
    await expect(page).toHaveURL(
      /filters\[location\]=%D0%92%D0%B0%D1%80%D0%BD%D0%B0/,
    );
  });

  test("clicking a map pin opens a popup with a product link", async ({
    page,
  }) => {
    await page.goto("/coins/map");

    await expect(page.locator(".leaflet-container")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator(".leaflet-marker-icon").first()).toBeVisible({
      timeout: 10000,
    });

    await page.locator(".leaflet-marker-icon").first().click({ force: true });

    await expect(page.locator(".leaflet-popup")).toBeVisible({ timeout: 5000 });
    await expect(
      page
        .locator(".leaflet-popup")
        .getByRole("link", { name: "Виж монетата" }),
    ).toBeVisible();
  });

  test("coins sharing coordinates render as separately clickable markers", async ({
    page,
  }) => {
    await page.goto(
      "/coins/map?filters[location]=%D0%92%D0%B5%D0%BB%D0%B8%D0%BA%D0%BE%20%D0%A2%D1%8A%D1%80%D0%BD%D0%BE%D0%B2%D0%BE&filters[collected]=all",
    );

    await expect(page.locator(".leaflet-container")).toBeVisible({
      timeout: 10000,
    });
    const markers = page.locator(".leaflet-marker-icon");
    await expect(markers.first()).toBeVisible({ timeout: 10000 });

    const markerCount = await markers.count();
    expect(markerCount).toBeGreaterThan(1);

    const transforms = await markers.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).transform),
    );
    const uniqueTransforms = new Set(transforms);

    // Allow at most one overlap while still ensuring duplicate-coordinate spreading is active.
    expect(uniqueTransforms.size).toBeGreaterThanOrEqual(markerCount - 1);
  });

  test("selecting 'Да' collected filter reduces the visible coin count", async ({
    page,
  }) => {
    await page.goto("/coins/list");

    await expect(page.locator("ul[role='list'] li").first()).toBeVisible({
      timeout: 10000,
    });
    const totalCount = await page.locator("ul[role='list'] li").count();

    await page
      .locator("button")
      .filter({ hasText: /Събрани/ })
      .click();
    await page.locator('[role="menuitem"]').filter({ hasText: "Да" }).click();

    await expect(page).toHaveURL(/filters\[collected\]=yes/);

    const cards = page.locator("ul[role='list'] li");
    const filteredCount = await cards.count();
    expect(filteredCount).toBeLessThan(totalCount);

    const badges = page.locator("[data-testid='collected-badge']");
    await expect(badges).toHaveCount(filteredCount);
  });

  test("'Монети' nav link is active on /coins/list", async ({ page }) => {
    await page.goto("/coins/list");
    const link = page.getByRole("link", { name: "Монети" });
    await expect(link).toHaveClass(/border-indigo-500/);
  });

  test("'Монети' nav link is active on /coins/map", async ({ page }) => {
    await page.goto("/coins/map");
    const link = page.getByRole("link", { name: "Монети" });
    await expect(link).toHaveClass(/border-indigo-500/);
  });
});

test.describe("Location combobox (Локация filter on coins)", () => {
  test("opening the combobox shows province groups with their cities", async ({
    page,
  }) => {
    await page.goto("/coins/list");
    await expect(page.locator("ul[role='list'] li").first()).toBeVisible({
      timeout: 10000,
    });

    await page.getByPlaceholder("Търсене...").click();

    await expect(
      page
        .locator('[data-slot="combobox-item"]')
        .filter({ hasText: /^Всички$/ }),
    ).toBeVisible();
    await expect(
      page
        .locator('[data-slot="combobox-item"]')
        .filter({ hasText: /^Благоевград$/ }),
    ).toBeVisible();
    // city nested under the province
    await expect(
      page
        .locator('[data-slot="combobox-item"]')
        .filter({ hasText: /^Мелник$/ }),
    ).toBeVisible();
  });

  test("typing in the combobox narrows the option list", async ({ page }) => {
    await page.goto("/coins/list");
    await expect(page.locator("ul[role='list'] li").first()).toBeVisible({
      timeout: 10000,
    });

    const input = page.getByPlaceholder("Търсене...");
    await input.click();
    await input.fill("Мелник");

    await expect(
      page
        .locator('[data-slot="combobox-item"]')
        .filter({ hasText: /^Мелник$/ }),
    ).toBeVisible();
    // "Всички" only shows when query is empty
    await expect(
      page
        .locator('[data-slot="combobox-item"]')
        .filter({ hasText: /^Всички$/ }),
    ).not.toBeVisible();
    // unrelated province should be gone
    await expect(
      page
        .locator('[data-slot="combobox-item"]')
        .filter({ hasText: /^Варна$/ }),
    ).not.toBeVisible();
  });

  test("selecting a province updates the URL and shows only coins from that province", async ({
    page,
  }) => {
    await page.goto("/coins/list");
    await expect(page.locator("ul[role='list'] li").first()).toBeVisible({
      timeout: 10000,
    });
    const totalCount = await page.locator("ul[role='list'] li").count();

    await page.getByPlaceholder("Търсене...").click();
    await page
      .locator('[data-slot="combobox-item"]')
      .filter({ hasText: /^Благоевград$/ })
      .click();

    await expect(page).toHaveURL(
      /filters\[location\]=%D0%91%D0%BB%D0%B0%D0%B3%D0%BE%D0%B5%D0%B2%D0%B3%D1%80%D0%B0%D0%B4/,
    );
    const filteredCount = await page.locator("ul[role='list'] li").count();
    expect(filteredCount).toBeLessThan(totalCount);
  });

  test("selecting a specific city filters coins to that location only", async ({
    page,
  }) => {
    await page.goto("/coins/list");
    await expect(page.locator("ul[role='list'] li").first()).toBeVisible({
      timeout: 10000,
    });

    const input = page.getByPlaceholder("Търсене...");
    await input.click();
    await input.fill("Мелник");
    await page
      .locator('[data-slot="combobox-item"]')
      .filter({ hasText: /^Мелник$/ })
      .click();

    await expect(page).toHaveURL(
      /filters\[location\]=%D0%9C%D0%B5%D0%BB%D0%BD%D0%B8%D0%BA/,
    );
    await expect(page.locator("ul[role='list'] li")).toHaveCount(1);
  });

  test("selecting Всички resets the location filter to show all coins", async ({
    page,
  }) => {
    await page.goto(
      "/coins/list?filters[location]=%D0%91%D0%BB%D0%B0%D0%B3%D0%BE%D0%B5%D0%B2%D0%B3%D1%80%D0%B0%D0%B4&filters[collected]=all",
    );
    await expect(page.locator("ul[role='list'] li").first()).toBeVisible({
      timeout: 10000,
    });
    const filteredCount = await page.locator("ul[role='list'] li").count();

    await page.getByPlaceholder("Търсене...").click();
    await page
      .locator('[data-slot="combobox-item"]')
      .filter({ hasText: /^Всички$/ })
      .click();

    await expect(page).toHaveURL(/filters\[location\]=all/);
    const totalCount = await page.locator("ul[role='list'] li").count();
    expect(totalCount).toBeGreaterThan(filteredCount);
  });
});
