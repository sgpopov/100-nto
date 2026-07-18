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

    const totalText = await page.getByTestId("filter-results").innerText();

    await page.getByPlaceholder("Търсене...").click();
    await page
      .locator('[data-slot="combobox-item"]')
      .filter({ hasText: /^Благоевградска област$/ })
      .click();

    await expect(page).toHaveURL(
      /filters\[location\]=%D0%91%D0%BB%D0%B0%D0%B3%D0%BE%D0%B5%D0%B2%D0%B3%D1%80%D0%B0%D0%B4%D1%81%D0%BA%D0%B0%20%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82/,
    );
    const filteredText = await page.getByTestId("filter-results").innerText();
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

    const filteredText = await page.getByTestId("filter-results").innerText();

    await page.getByPlaceholder("Търсене...").click();
    await page
      .locator('[data-slot="combobox-item"]')
      .filter({ hasText: /^Всички$/ })
      .click();

    await expect(page).toHaveURL(/filters\[location\]=all/);
    const totalText = await page.getByTestId("filter-results").innerText();
    expect(totalText).not.toBe(filteredText);
  });
});

test.describe("Печат collection state", () => {
  const stampIcons = "[data-testid='stamp-icon']";
  const stickerIcons = "[data-testid='sticker-icon']";
  const unavailableIcons = "[data-testid='sticker-unavailable-icon']";

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
    // The dataset holds both, so assert the pair rather than a single status.
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
    const stickers = await page.locator(stickerIcons).count();

    expect(stickers).toBeGreaterThan(0);
    expect(stickers).toBeLessThan(stamps);
  });

  test("unstamped sites show neither collection icon", async ({ page }) => {
    await page.goto("/sites/list?filters[stamp]=not-collected");

    await expect(page.locator("ul[role='list'] > li > a").first()).toBeVisible();

    expect(await page.locator(stampIcons).count()).toBe(0);
    expect(await page.locator(stickerIcons).count()).toBe(0);
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
    // Национален военноисторически музей is the only София site with no марка.
    await page.goto("/sites/list?filters[location]=София");

    await expect(page.locator("ul[role='list'] > li > a").first()).toBeVisible();

    await expect(page.locator(unavailableIcons)).toHaveCount(1);
    await expect(
      page.getByRole("img", { name: "Няма марка за този обект" }),
    ).toBeVisible();
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

test.describe("Марка filter", () => {
  const rows = "ul[role='list'] > li > a";
  const stampIcons = "[data-testid='stamp-icon']";
  const stickerIcons = "[data-testid='sticker-icon']";
  const unavailableIcons = "[data-testid='sticker-unavailable-icon']";

  test("the control offers exactly the four options", async ({ page }) => {
    await page.goto("/sites/list");

    await page.getByRole("button", { name: /^Марка:/ }).click();

    for (const label of ["Всички", "Събрани", "Несъбрани", "Не се предлага"]) {
      await expect(
        page.getByRole("menuitem").filter({ hasText: new RegExp(`^${label}$`) }),
      ).toBeVisible();
    }
    await expect(page.getByRole("menuitem")).toHaveCount(4);
  });

  test("choosing an option writes it to its own query parameter", async ({
    page,
  }) => {
    await page.goto("/sites/list");

    await page.getByRole("button", { name: /^Марка:/ }).click();
    await page
      .getByRole("menuitem")
      .filter({ hasText: /^Събрани$/ })
      .click();

    await expect(page).toHaveURL(/filters\[sticker\]=collected/);
    await expect(page).toHaveURL(/filters\[stamp\]=all/);
  });

  test("collected shows only sites carrying a марка", async ({ page }) => {
    await page.goto("/sites/list?filters[sticker]=collected");

    await expect(page.locator(rows).first()).toBeVisible();
    const count = await page.locator(rows).count();

    expect(count).toBeGreaterThan(0);
    expect(await page.locator(stickerIcons).count()).toBe(count);
    expect(await page.locator(unavailableIcons).count()).toBe(0);
  });

  test("not collected excludes both collected марки and sites offering none", async ({
    page,
  }) => {
    await page.goto("/sites/list?filters[sticker]=not-collected");

    await expect(page.locator(rows).first()).toBeVisible();

    expect(await page.locator(rows).count()).toBeGreaterThan(0);
    expect(await page.locator(stickerIcons).count()).toBe(0);
    expect(await page.locator(unavailableIcons).count()).toBe(0);
  });

  test("not available returns exactly the sites offering no марка", async ({
    page,
  }) => {
    await page.goto("/sites/list?filters[sticker]=not-available");

    await expect(page.locator(rows).first()).toBeVisible();
    const count = await page.locator(rows).count();

    expect(await page.locator(unavailableIcons).count()).toBe(count);
    expect(await page.locator(stickerIcons).count()).toBe(0);
  });

  // Collected plus not-collected deliberately falls short of all: the sites
  // offering no марка sit outside both.
  test("all shows more sites than collected and not collected together", async ({
    page,
  }) => {
    await page.goto("/sites/list?filters[sticker]=all");
    await expect(page.locator(rows).first()).toBeVisible();
    const all = await page.locator(rows).count();

    await page.goto("/sites/list?filters[sticker]=collected");
    await expect(page.locator(rows).first()).toBeVisible();
    const collected = await page.locator(rows).count();

    await page.goto("/sites/list?filters[sticker]=not-collected");
    await expect(page.locator(rows).first()).toBeVisible();
    const notCollected = await page.locator(rows).count();

    expect(collected + notCollected).toBeLessThan(all);
  });

  test("the stamp and sticker filters combine into the trip-planning view", async ({
    page,
  }) => {
    await page.goto(
      "/sites/list?filters[stamp]=collected&filters[sticker]=not-collected",
    );

    await expect(page.locator(rows).first()).toBeVisible();
    const count = await page.locator(rows).count();

    expect(count).toBeGreaterThan(0);
    expect(await page.locator(stampIcons).count()).toBe(count);
    expect(await page.locator(stickerIcons).count()).toBe(0);
    expect(await page.locator(unavailableIcons).count()).toBe(0);

    await page.goto("/sites/list?filters[stamp]=collected");
    await expect(page.locator(rows).first()).toBeVisible();
    expect(await page.locator(rows).count()).toBeGreaterThan(count);
  });

  test("both filters combine with the location filter", async ({ page }) => {
    await page.goto(
      "/sites/list?filters[location]=Царево&filters[stamp]=collected&filters[sticker]=not-collected",
    );

    await expect(page.locator(rows).first()).toBeVisible();
    expect(await page.locator(rows).count()).toBe(1);

    await page.goto(
      "/sites/list?filters[location]=Царево&filters[stamp]=collected&filters[sticker]=collected",
    );
    await expect(page.locator(rows)).toHaveCount(0);
  });

  test("the sticker selection survives switching to the map", async ({
    page,
  }) => {
    await page.goto("/sites/list?filters[sticker]=not-available");

    await page.getByRole("link", { name: "Карта" }).click();

    await expect(page).toHaveURL(/\/sites\/map/);
    await expect(page).toHaveURL(/filters\[sticker\]=not-available/);

    await expect(page.locator("[data-pin-status]")).toHaveCount(1, {
      timeout: 10000,
    });
  });

  test("the controls stay reachable on a narrow viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await page.goto("/sites/list");

    await expect(page.getByPlaceholder("Търсене...")).toBeVisible();
    await expect(page.getByRole("button", { name: /^Печат:/ })).toBeVisible();

    const marka = page.getByRole("button", { name: /^Марка:/ });
    await expect(marka).toBeVisible();

    const box = await marka.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375);

    await marka.click();
    await expect(
      page.getByRole("menuitem").filter({ hasText: /^Не се предлага$/ }),
    ).toBeVisible();
  });
});

test.describe("Filter summary", () => {
  const summary = (page: Page) => page.getByTestId("filter-results");

  test("the total alone is shown when nothing is filtered", async ({
    page,
  }) => {
    await page.goto("/sites/list");

    await expect(summary(page)).toHaveText("246 резултата");
  });

  test("a narrowed list is reported against the full total", async ({
    page,
  }) => {
    await page.goto("/sites/list?filters[sticker]=not-available");

    // The one site offering no марка also covers the singular noun.
    await expect(summary(page)).toHaveText("1 резултат от 246");
  });

  test("Изчисти is absent until a filter is applied", async ({ page }) => {
    await page.goto("/sites/list");

    await expect(page.getByRole("button", { name: "Изчисти" })).toHaveCount(0);
  });

  test("Изчисти resets every filter at once", async ({ page }) => {
    await page.goto(
      "/sites/list?filters[location]=Банско&filters[stamp]=collected&filters[sticker]=not-collected",
    );

    await page.getByRole("button", { name: "Изчисти" }).click();

    await expect(page).toHaveURL(/filters\[location\]=all/);
    await expect(page).toHaveURL(/filters\[stamp\]=all/);
    await expect(page).toHaveURL(/filters\[sticker\]=all/);
    await expect(summary(page)).toHaveText("246 резултата");
  });
});
