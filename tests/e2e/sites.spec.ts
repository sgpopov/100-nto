import { test, expect, type Page } from "@playwright/test";

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
      "/sites/list?filters[location]=%D0%91%D0%B0%D0%BD%D1%81%D0%BA%D0%BE&filters[stamp]=collected"
    );

    await page.getByRole("link", { name: "Карта" }).click();

    await expect(page).toHaveURL(/\/sites\/map/);
    await expect(page).toHaveURL(/filters\[location\]=%D0%91%D0%B0%D0%BD%D1%81%D0%BA%D0%BE/);
    await expect(page).toHaveURL(/filters\[stamp\]=collected/);
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
      "/sites/list?filters[location]=%D0%91%D0%B0%D0%BD%D1%81%D0%BA%D0%BE&filters[stamp]=all",
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

test.describe("Печат collection state", () => {
  const stampIcons = "[data-testid='stamp-icon']";
  const stickerIcons = "[data-testid='sticker-icon']";
  const unavailableIcons = "[data-testid='sticker-unavailable-icon']";

  /** Opens a map URL and waits for leaflet to have drawn its pins. */
  const gotoMap = async (page: Page, url: string) => {
    await page.goto(url);

    await expect(page.locator(".leaflet-container")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("[data-pin-status]").first()).toBeVisible({
      timeout: 10000,
    });
  };

  test("list view marks stamped sites and leaves the rest unmarked", async ({
    page,
  }) => {
    await page.goto("/sites/list?filters[stamp]=collected");

    const sites = page.locator("ul[role='list'] > li > a");
    await expect(sites.first()).toBeVisible();

    expect(await page.locator(stampIcons).count()).toBe(await sites.count());

    await page.goto("/sites/list?filters[stamp]=not-collected");
    await expect(page.locator("ul[role='list'] > li > a").first()).toBeVisible();

    expect(await page.locator(stampIcons).count()).toBe(0);
  });

  test("the stamp icon carries a Bulgarian screen-reader label", async ({
    page,
  }) => {
    await page.goto("/sites/list?filters[stamp]=collected");

    await expect(
      page.getByRole("img", { name: "Събран печат" }).first(),
    ).toBeVisible();
  });

  test("the stamp filter narrows the result count", async ({ page }) => {
    await page.goto("/sites/list?filters[stamp]=all");
    const all = await page.locator(stampIcons).count();

    await page.goto("/sites/list?filters[stamp]=collected");
    const stamped = page.locator("ul[role='list'] > li > a");
    await expect(stamped.first()).toBeVisible();

    expect(await stamped.count()).toBe(all);
  });

  test("map pins publish a collection status", async ({ page }) => {
    await page.goto("/sites/map?filters[stamp]=all");

    await expect(page.locator(".leaflet-container")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("[data-pin-status]").first()).toBeVisible({
      timeout: 10000,
    });

    const statuses = await page
      .locator("[data-pin-status]")
      .evaluateAll((pins) =>
        pins.map((pin) => pin.getAttribute("data-pin-status")),
      );

    expect(statuses.length).toBeGreaterThan(0);
    expect(
      statuses.every((s) => ["none", "partial", "complete"].includes(s ?? "")),
    ).toBe(true);
  });

  test("stamped sites render as partial or complete, never as untouched", async ({
    page,
  }) => {
    await page.goto("/sites/map?filters[stamp]=collected");

    await expect(page.locator(".leaflet-container")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("[data-pin-status]").first()).toBeVisible({
      timeout: 10000,
    });

    const statuses = await page
      .locator("[data-pin-status]")
      .evaluateAll((pins) =>
        pins.map((pin) => pin.getAttribute("data-pin-status")),
      );

    expect(statuses.length).toBeGreaterThan(0);
    // A stamped site is partial until its марка arrives, then complete. Both
    // are present in the dataset, so assert only that neither reads as "none".
    expect(statuses.every((s) => s === "partial" || s === "complete")).toBe(
      true,
    );
    expect(statuses).toContain("partial");
    expect(statuses).toContain("complete");
  });

  test("unstamped sites render as nothing collected", async ({ page }) => {
    await page.goto("/sites/map?filters[stamp]=not-collected");

    await expect(page.locator(".leaflet-container")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("[data-pin-status]").first()).toBeVisible({
      timeout: 10000,
    });

    const statuses = await page
      .locator("[data-pin-status]")
      .evaluateAll((pins) =>
        pins.map((pin) => pin.getAttribute("data-pin-status")),
      );

    expect(statuses.every((s) => s === "none")).toBe(true);
  });

  test("the марка icon appears only on a subset of the stamped sites", async ({
    page,
  }) => {
    await page.goto("/sites/list?filters[stamp]=collected");

    const sites = page.locator("ul[role='list'] > li > a");
    await expect(sites.first()).toBeVisible();

    const stamps = await page.locator(stampIcons).count();
    const stickers = await page.locator("[data-testid='sticker-icon']").count();

    // Every марка in the dataset sits on a stamped site, and some stamped
    // sites are still waiting for theirs.
    expect(stickers).toBeGreaterThan(0);
    expect(stickers).toBeLessThan(stamps);
  });

  test("unstamped sites show neither collection icon", async ({ page }) => {
    await page.goto("/sites/list?filters[stamp]=not-collected");

    await expect(page.locator("ul[role='list'] > li > a").first()).toBeVisible();

    expect(await page.locator(stampIcons).count()).toBe(0);
    expect(await page.locator("[data-testid='sticker-icon']").count()).toBe(0);
  });

  test("the марка icon carries a Bulgarian screen-reader label", async ({
    page,
  }) => {
    await page.goto("/sites/list?filters[stamp]=collected");

    await expect(
      page.getByRole("img", { name: "Събрана марка" }).first(),
    ).toBeVisible();
  });

  test("a site offering no марка shows the unavailable icon", async ({
    page,
  }) => {
    // Национален военноисторически музей is the one site in София that offers
    // no марка; its stamped neighbours make the icon's distinctness visible.
    await page.goto("/sites/list?filters[location]=София");

    await expect(page.locator("ul[role='list'] > li > a").first()).toBeVisible();

    await expect(page.locator(unavailableIcons)).toHaveCount(1);
    await expect(
      page.getByRole("img", { name: "Няма марка за този обект" }),
    ).toBeVisible();
    // The absent марка is never also reported as collected.
    const row = page.locator("ul[role='list'] > li > a").filter({
      has: page.locator(unavailableIcons),
    });
    await expect(row.locator(stickerIcons)).toHaveCount(0);
    await expect(row.locator(stampIcons)).toHaveCount(1);
  });

  test("a complete pin's popup shows both collection icons", async ({
    page,
  }) => {
    // Both Видин sites have печат and марка, so any pin here is complete.
    await gotoMap(page, "/sites/map?filters[location]=Видин");

    await page.locator("[data-pin-status='complete']").first().click();

    const popup = page.locator(".leaflet-popup");
    await expect(popup.locator(stampIcons)).toBeVisible();
    await expect(popup.locator(stickerIcons)).toBeVisible();
  });

  test("a partial pin's popup shows the печат without a марка", async ({
    page,
  }) => {
    // Царево has a single site: stamped, марка still outstanding.
    await gotoMap(page, "/sites/map?filters[location]=Царево");

    await page.locator("[data-pin-status='partial']").first().click();

    const popup = page.locator(".leaflet-popup");
    await expect(popup.locator(stampIcons)).toBeVisible();
    await expect(popup.locator(stickerIcons)).toHaveCount(0);
    await expect(popup.locator(unavailableIcons)).toHaveCount(0);
  });

  test("a stale visited link falls back to showing every site", async ({
    page,
  }) => {
    await page.goto("/sites/list?filters[visited]=visited");

    await expect(page).toHaveURL(/filters\[stamp\]=all/);
    await expect(page).not.toHaveURL(/visited/);
  });
});
