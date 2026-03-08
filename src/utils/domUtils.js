export const hiddenAnimeDeleted = (id) => {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = "none";
    }
};
