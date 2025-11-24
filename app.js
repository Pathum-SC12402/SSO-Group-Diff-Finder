let jsonGroups = []; // Groups loaded from JSON
    let compareGroupsSet = new Set(); // Groups from the textarea
    let ignoreGroups = []; // Groups loaded from the ignore file
    let lastFilteredGroups = []; // The final list displayed to the user

    // --- Utility Functions ---

    function displayResults(groups, title) {
        lastFilteredGroups = groups;
        const ul = document.getElementById("resultList");
        ul.innerHTML = "";
        document.getElementById("resultTitle").style.display = 'block';
        document.getElementById("resultTitle").textContent = title;

        if (groups.length === 0) {
            ul.innerHTML = "<li>The resulting group list is empty.</li>";
            document.getElementById("downloadBtn").style.display = "none";
        } else {
            groups.forEach((g, index) => {
                const li = document.createElement("li");
                li.textContent = `${index + 1}. ${g}`;
                ul.appendChild(li);
            });
            document.getElementById("downloadBtn").style.display = "block";
        }
    }


    // --- Core Functions ---

    function loadGroups() {
        const fileInput = document.getElementById("jsonFile");
        if (!fileInput.files.length) {
            alert("Please upload sso-groups.json!");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                if (!data.Groups || !Array.isArray(data.Groups)) {
                    throw new Error("JSON structure is incorrect. Expected a 'Groups' array.");
                }
                jsonGroups = data.Groups.map(g => g.DisplayName).filter(g => typeof g === 'string' && g.length > 0);
                
                displayResults(jsonGroups, "Source SSO Groups Loaded");
                alert(`Successfully loaded ${jsonGroups.length} source groups.`);
                document.getElementById("filterBtn").style.display = "none";
            } catch (e) {
                alert(`Invalid JSON file format or structure! Error: ${e.message}`);
                jsonGroups = []; 
            }
        };
        reader.readAsText(fileInput.files[0]);
    }


    function compareGroups() {
        if (jsonGroups.length === 0) {
            alert("Please load sso-groups.json first (Step 1)!");
            return;
        }

        const text = document.getElementById("compareInput").value.trim();
        if (!text) {
            alert("Enter SSO groups to compare in the textarea!");
            return;
        }

        // Build a Set for O(1) lookup performance
        compareGroupsSet = new Set(text
            .split("\n")
            .map(g => g.trim())
            .filter(g => g.length > 0));

        // Filter jsonGroups by excluding groups present in compareGroupsSet
        const initialAdditionalGroups = jsonGroups.filter(g => !compareGroupsSet.has(g));
        
        displayResults(initialAdditionalGroups, "Additional SSO Groups (Source - Comparison)");

        if (initialAdditionalGroups.length > 0 && ignoreGroups.length > 0) {
            document.getElementById("filterBtn").style.display = "block";
            alert(`Comparison complete. ${initialAdditionalGroups.length} additional groups found. Click 'Apply Ignore Filter' to refine.`);
        } else {
            document.getElementById("filterBtn").style.display = "none";
            alert(`Comparison complete. ${initialAdditionalGroups.length} additional groups found.`);
        }
    }

    function loadIgnoreList() {
        const fileInput = document.getElementById("ignoreFile");
        if (!fileInput.files.length) {
            alert("Please upload a .txt file for the ignore list!");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const textContent = event.target.result;
            // Split by new line, trim, and filter out empty lines
            ignoreGroups = textContent
                .split(/[\r\n]+/) // Split by carriage return and/or newline
                .map(g => g.trim())
                .filter(g => g.length > 0);
            
            alert(`Successfully loaded ${ignoreGroups.length} groups into the ignore list.`);

            // If groups were previously filtered, show the apply button
            if (lastFilteredGroups.length > 0) {
                document.getElementById("filterBtn").style.display = "block";
            }
        };
        reader.readAsText(fileInput.files[0]);
    }

    function applyIgnoreFilter() {
        if (lastFilteredGroups.length === 0) {
            alert("Please run 'Find Additional Groups' first (Step 2)!");
            return;
        }
        if (ignoreGroups.length === 0) {
            alert("Please load an ignore list file first (Step 3)!");
            return;
        }

        // Convert ignoreGroups to a Set for efficient lookup
        const ignoreSet = new Set(ignoreGroups);

        // Filter the last result list
        const finalGroups = lastFilteredGroups.filter(g => !ignoreSet.has(g));

        displayResults(finalGroups, "Final Filtered SSO Groups (Additional - Ignored)");
        
        document.getElementById("filterBtn").style.display = "none";
        alert(`Filter applied. ${finalGroups.length} groups remain after ignoring ${ignoreGroups.length} groups.`);
    }

    // --- NEW Search Function ---

    function searchFilter() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        
        // Use the base list (after steps 1-3) for filtering
        if (baseResultGroups.length === 0) return;

        if (searchTerm === "") {
            // If search is cleared, show the base list
            displayResults(baseResultGroups, document.getElementById("resultTitle").textContent, false);
            return;
        }

        // Perform the filter
        const searchedGroups = baseResultGroups.filter(g => g.toLowerCase().includes(searchTerm));

        // Display the searched groups, keeping the original title and not triggering the search bar visibility logic
        displayResults(searchedGroups, document.getElementById("resultTitle").textContent + ` (Showing ${searchedGroups.length} of ${baseResultGroups.length})`, false);
    }

    function downloadResult() {
        if (lastFilteredGroups.length === 0) {
            alert("Nothing to download!");
            return;
        }

        // Create the content string with numbering
        const textLines = [`SSO Group Comparator Result: ${document.getElementById("resultTitle").textContent}`];
        textLines.push("---");
        lastFilteredGroups.forEach((g, index) => {
            textLines.push(`${index + 1}. ${g}`);
        });
        
        const textOutput = textLines.join('\n');

        // Create a Blob (a file-like object) containing the text content
        const blob = new Blob([textOutput], { type: 'text/plain;charset=utf-8' });

        // Create a link element to trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        
        // File name
        link.download = "final-sso-group-list.txt"; 
        
        // Trigger the download and clean up
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }