(function () {
  function rewriteAcademicSyllabusLinks() {
    try {
      var pathname = (location.pathname || "").replace(/\\/g, "/");
      var cleaned = pathname.replace(/\/index\.html$/i, "").replace(/\/+$/, "");
      var parts = cleaned.split("/").filter(Boolean);
      if (
        parts.length < 2 ||
        String(parts[0]).toLowerCase() !== "anna-university-notes"
      )
        return;

      var dept = String(parts[1] || "").toLowerCase();
      var subject = parts.length > 2 ? String(parts[2] || "").toLowerCase() : "";

      var resolvedHref;
      if (parts.length >= 3 && dept && subject) {
        resolvedHref = "../../../syllabus/" + dept + "/" + subject + "/";
      } else {
        resolvedHref = "../../syllabus/index.html";
      }

      document.querySelectorAll("a").forEach(function (link) {
        var label = (link.textContent || "").trim().toLowerCase();
        if (label === "view syllabus") link.setAttribute("href", resolvedHref);
      });
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", rewriteAcademicSyllabusLinks);
  } else {
    rewriteAcademicSyllabusLinks();
  }
  window.addEventListener("load", rewriteAcademicSyllabusLinks, false);
})();
