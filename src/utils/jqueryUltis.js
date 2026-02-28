export const hiddenAnimeDeteled = (id) => {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = "none";
    }
};
