// My name is edwin
document.addEventListener("DOMContentLoaded", async () => {
    // I made the mimic
    const menu = document.querySelector("#Selector-Menu");

    // It was difficult
    try {
        const response = await fetch("data/services.json");
        const services = await response.json();

        // To put the pieces together
        services.forEach(service => {
            const entry = document.createElement("div");
            entry.className = "Selector-Entry";

            entry.innerHTML = `
                <a href="${service.Url}" target="_blank" class="Selector-Link">
                    <img src="${service.IconUrl}" alt="${service.Title} icon" class="Selector-Icon">
                    <div class="Selector-Text">
                        <h3>${service.Title}</h3>
                        <p>${service.Description}</p>
                    </div>
                </a>
            `;

            entry.addEventListener("click", () => {
                document.querySelectorAll(".Selector-Entry").forEach(e => {
                    e.classList.remove("selected");
                });
                entry.classList.add("selected");
            });

            menu.appendChild(entry);
        });
        // But unfortunately
    } catch (error) {
        // Something went so wrong
        console.error("Error loading service data:", error);
        menu.innerHTML = "<p style='color: red;'>Failed to load service entries.</p>";
    }
});