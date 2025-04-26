//
// NOTE: Use this code in the browser console
//

const container = document.getElementsByClassName("view-content")[0];
const result = [];
let currentCity = null;

// Loop through all child nodes (h3 for city, div.obekt-row for site)
container.childNodes.forEach((node) => {
  if (node.nodeType === Node.ELEMENT_NODE) {
    if (node.tagName === "H3") {
      // If it's a city name
      currentCity = {
        city: node.textContent.trim(),
        sites: [],
      };
      result.push(currentCity);
    } else if (node.classList.contains("obekt-row") && currentCity) {
      // If it's a site entry under a city
      const numberDiv = node.querySelector(
        ".views-field-field-obekt-nomer .field-content"
      );
      const nameLink = node.querySelector(".views-field-title a");
      const imageTag = node.querySelector(".views-field-field-image img");
      const link = node.querySelector(".glink a");

      if (numberDiv && nameLink) {
        const site = {
          name: nameLink.textContent.trim(),
          number: numberDiv.textContent.trim(),
          image: imageTag ? imageTag.src : null,
          link: link ? link.href : null,
          visited: false,
        };
        currentCity.sites.push(site);
      }
    }
  }
});

console.log(JSON.stringify(result, null, 2));
