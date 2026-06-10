const API_URL = "https://api.artdance.mishu-soft.org/students/";

async function fetchStudents() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log("Data fetched successfully:", data);
        // Trainees will write code here to inject data into the DOM
    } catch (error) {
        console.error("Error communicating with backend API:", error);
    }
}

// Initialize on page load
fetchStudents();