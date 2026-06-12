window.processAdminLogin = function(event) {
    event.preventDefault();

    const username = document.getElementById("adminUser").value.trim();
    const accessKey = document.getElementById("adminPass").value.trim();

    // 🔒 Your Master Administrative Credentials
    const MASTER_ADMIN_USER = "AdminDCSA26";
    const MASTER_ADMIN_KEY = "AKC26";

    if (username === MASTER_ADMIN_USER && accessKey === MASTER_ADMIN_KEY) {
        // Place an active security passport token into the browser session
        sessionStorage.setItem("adminAuthenticated", "true");
        
        alert("Authorization Granted.\nWelcome back, Administrator.");
        window.location.href = "admin.html";
    } else {
        alert("Access Denied:\nInvalid administrative username or security key configuration.");
    }
};