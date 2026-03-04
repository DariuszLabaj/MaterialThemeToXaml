let materialThemeJson = null;
const snackbar = document.getElementById("app-snackbar");

    document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById('fileInput');
    const previewElement = document.getElementById("jsonPreview");

    if (!fileInput) {
      //alert("File input element not found. Check your HTML.");
      showSnackbar("File input element not found. Check your HTML.");
      return;
    }

    fileInput.addEventListener('change', function (event) {
      const file = event.target.files[0];

      if (!file) {
        //alert("No file selected.");
        showSnackbar("No file selected.");
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          materialThemeJson = JSON.parse(e.target.result);
          //alert("JSON loaded successfully.");
          showSnackbar("JSON loaded successfully.");
          renderTheme(materialThemeJson);
        } catch (err) {
          //alert("Failed to parse JSON.");
          showSnackbar("Failed to parse JSON.");
        }
      };

      reader.onerror = () => {
        //alert("Error reading file.");
        showSnackbar("Error reading file.");
      };

      reader.readAsText(file);
    });
  });

    function generateXamlContent(theme, category) {
      const lines = [
        `<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"`,
        `                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">`
      ];

      for (const [key, value] of Object.entries(theme)) {
        if (value && typeof value === "string" && value.startsWith('#')) {
          lines.push(`    <Color x:Key="${key}">${value}</Color>`);
          lines.push(`    <SolidColorBrush x:Key="${key}Brush" Color="{StaticResource ${key}}"/>`);
        }
      }

      lines.push(`</ResourceDictionary>`);
      return lines.join('\n');
    }

    async function generateZip() {
      if (!materialThemeJson) {
        //alert("Please upload a valid Material Theme JSON first.");
        showSnackbar("Please upload a valid Material Theme JSON first.");
        return;
      }

      const zip = new JSZip();

      if (materialThemeJson.schemes) {
        for (const [schemeName, schemeData] of Object.entries(materialThemeJson.schemes)) {
          const xaml = generateXamlContent(schemeData, 'schemes');
          zip.file(`schemes/${schemeName}.xaml`, xaml);
        }
      }

      if (materialThemeJson.palettes) {
        for (const [schemeName, schemeData] of Object.entries(materialThemeJson.palettes)) {
          const xaml = generateXamlContent(schemeData, 'palettes');
          zip.file(`palettes/${schemeName}.xaml`, xaml);
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "material_theme_xaml.zip";
      link.click();
    }

function renderTheme(data) {
    const output = document.getElementById('output');
    output.innerHTML = "";

    if (data.coreColors) {
        const coreDiv = document.createElement('div');
        coreDiv.className = 'scheme-container';
        coreDiv.innerHTML = `<h2 class="scheme-title">Core Colors</h2>`;

        const coreGrid = document.createElement('div');
        coreGrid.className = 'swatch-grid';

        Object.entries(data.coreColors).forEach(([name, hex]) => {
            const swatch = createSwatch(name, hex);
            coreGrid.appendChild(swatch);
        });

        coreDiv.appendChild(coreGrid);
        output.appendChild(coreDiv);
    }

    if (data.schemes) {
        Object.entries(data.schemes).forEach(([schemeName, colors]) => {
            const schemeDiv = document.createElement('div');
            schemeDiv.className = "scheme-container";
            schemeDiv.innerHTML = `<h2 class="scheme-title">${capitalize(schemeName)} Scheme</h2>`;

            const schemeGrid = document.createElement('div');
            schemeGrid.className = 'swatch-grid';

            Object.entries(colors).forEach(([key, hex]) => {
                const swatch = createSwatch(key, hex);
                schemeGrid.appendChild(swatch);
            });

            schemeDiv.appendChild(schemeGrid);
            output.appendChild(schemeDiv);
        });
    }
}

function createSwatch(label, hex) {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = hex;
    swatch.textContent = label;
    return swatch;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showSnackbar(message)
{
    snackbar.querySelector(".md-snackbar__message").textContent = message;
    snackbar.classList.add("md-snackbar--show");

    setTimeout(() =>
    {
        snackbar.classList.remove("md-snackbar--show");
    }, 4000);
}
