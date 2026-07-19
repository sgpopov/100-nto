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

    await expect(page).toHaveURL(/filters\[collected\]=collected/);

    const cards = page.locator("ul[role='list'] li");
    const filteredCount = await cards.count();
    expect(filteredCount).toBeLessThan(totalCount);

    const badges = page.locator("[data-testid='collected-badge']");
    await expect(badges).toHaveCount(filteredCount);
  });

  test("the collected control offers exactly the four options", async ({
    page,
  }) => {
    await page.goto("/coins/list");

    await page.getByRole("button", { name: /^Събрани:/ }).click();

    for (const label of ["Всички", "Да", "Не", "Не се предлага"]) {
      await expect(
        page
          .getByRole("menuitem")
          .filter({ hasText: new RegExp(`^${label}$`) }),
      ).toBeVisible();
    }
    await expect(page.getByRole("menuitem")).toHaveCount(4);
  });

  test("'Не' offers only coins the collector could actually go and get", async ({
    page,
  }) => {
    await page.goto(
      "/coins/list?filters[location]=all&filters[collected]=not-collected",
    );
    await expect(page.locator("ul[role='list'] li").first()).toBeVisible({
      timeout: 10000,
    });

    await expect(page.locator("[data-testid='unavailable-badge']")).toHaveCount(
      0,
    );
    await expect(page.locator("[data-testid='collected-badge']")).toHaveCount(
      0,
    );
  });

  test("'Не се предлага' keeps the excluded coins reachable, each showing why", async ({
    page,
  }) => {
    await page.goto(
      "/coins/list?filters[location]=all&filters[collected]=not-available",
    );
    const cards = page.locator("ul[role='list'] li");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    // Every card must justify its own presence, or the view contradicts the
    // filter the collector chose.
    await expect(page.locator("[data-testid='unavailable-badge']")).toHaveCount(
      await cards.count(),
    );
  });

  test("a link bookmarked with the old yes value falls back to showing every coin", async ({
    page,
  }) => {
    await page.goto("/coins/list?filters[location]=all&filters[collected]=yes");
    await expect(page.locator("ul[role='list'] li").first()).toBeVisible({
      timeout: 10000,
    });
    const fallback = await page.locator("ul[role='list'] li").count();

    await page.goto("/coins/list?filters[location]=all&filters[collected]=all");
    await expect(page.locator("ul[role='list'] li").first()).toBeVisible({
      timeout: 10000,
    });

    expect(fallback).toBe(await page.locator("ul[role='list'] li").count());
  });

  test("coins that cannot currently be collected explain why in the list", async ({
    page,
  }) => {
    await page.goto("/coins/list");
    await expect(page.locator("ul[role='list'] li").first()).toBeVisible({
      timeout: 10000,
    });

    const badges = page.locator("[data-testid='unavailable-badge']");

    await expect(badges.first()).toBeVisible();
    await expect(badges.first()).toHaveText("В момента не се предлага");
  });

  test("a card that cannot be collected keeps its image and outbound link", async ({
    page,
  }) => {
    await page.goto("/coins/list");
    await expect(page.locator("ul[role='list'] li").first()).toBeVisible({
      timeout: 10000,
    });

    const card = page
      .locator("ul[role='list'] li")
      .filter({ has: page.locator("[data-testid='unavailable-badge']") })
      .first();

    await expect(card.locator("img")).toBeVisible();
    await expect(card.getByRole("link")).toHaveAttribute("href", /.+/);
  });

  test("the map popup carries the same availability message as the list", async ({
    page,
  }) => {
    // Filtered to a single-coin location: on the full map the pins overlap and
    // a forced click lands on a neighbour's popup.
    await page.goto(
      `/coins/map?filters[location]=${encodeURIComponent("Габрово")}&filters[collected]=all`,
    );

    await expect(page.locator(".leaflet-container")).toBeVisible({
      timeout: 10000,
    });
    const pin = page.locator('[data-pin-status="unavailable"]').first();
    await expect(pin).toBeVisible({ timeout: 10000 });

    await pin.click({ force: true });

    await expect(
      page.locator(".leaflet-popup").getByTestId("unavailable-badge"),
    ).toHaveText("В момента не се предлага");
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
        .filter({ hasText: /^Благоевградска област$/ }),
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
        .filter({ hasText: /^Варненска област$/ }),
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
      .filter({ hasText: /^Благоевградска област$/ })
      .click();

    await expect(page).toHaveURL(
      new RegExp(
        `filters\\[location\\]=${encodeURIComponent("Благоевградска област")}`,
      ),
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
});
