document.addEventListener("DOMContentLoaded", updateCommentCount);

async function updateCommentCount() {
    const repository = "ChoHon/chohon.github.io";
    const baseUrl = "https://chohon.github.io"

    try {
        const response = await fetch(`https://api.github.com/repos/${repository}/issues`);
        if (!response.ok) { throw new Error("Failed to fetch issues"); }
        const issues = await response.json();

        const issueDataMap = new Map();
        issues.forEach(issue => {
            const { body, comments } = issue;
            const lines = body.split("\n");

            lines.forEach(line => {
                if (line.includes(baseUrl)) {
                    const url = line.split("]")[0].replace("[", "");
                    const { pathname } = new URL(url);
                    issueDataMap.set(pathname.slice(0, -1), comments);
                }
            })                   
        })

        document.querySelectorAll(".comment_count").forEach(element => {
            const pathname = element.getAttribute("pathname")
            const count = issueDataMap.get(pathname) ?? 0;

            element.textContent = count;
        });
    } catch (error) {
        console.error("댓글 카운트 불러오기 실패:", error);
    }
}