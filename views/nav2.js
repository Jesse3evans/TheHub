function openMenu() {
    document.getElementById("opener").style.left = "-25%";
    document.getElementById("menu").style.left = "0";
    document.getElementById("full-overlay").style.display = "block";
    document.getElementById("full-overlay").style.left = "15%";

    document.getElementById("content").style.left = "15%";
    
   
}

function closeMenu() {
    document.getElementById("opener").style.left = "0";
    document.getElementById("menu").style.left = "-15%";
    document.getElementById("full-overlay").style.left = "0";
    document.getElementById("full-overlay").style.display = "none";
    document.getElementById("content").style.left = "0";

}