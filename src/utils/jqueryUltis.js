import $ from "jquery";

export const hiddenAnimeDeteled = (id) => {
    $("#" + id).css("display", "none");
};
