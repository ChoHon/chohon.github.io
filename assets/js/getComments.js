document.addEventListener("DOMContentLoaded", updateCommentCount);

async function updateCommentCount() {
    const repository = "ChoHon/chohon.github.io";

    try {
        const response = await fetch(`https://api.github.com/repos/${repository}/issues`);
        if (!response.ok) { throw new Error("Failed to fetch issues"); }
        const issues = await response.json();

        const issueDataMap = new Map(
            issues.map(({ title, comments }) => [title, comments])
        );

        document.querySelectorAll(".archive__item").forEach(element => {
            const postTitle = element.querySelector(".archive__item-title").innerText;
            const count = issueDataMap.get(postTitle) ?? 0;

            element.querySelector(".comment_count").textContent = count;
        });
    } catch (error) {
        console.error("댓글 카운트 불러오기 실패:", error);
    }
}