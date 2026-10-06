const AI_SLOP_LABEL = "AI slop"
const MISSING_DISCLOSURE_LABEL = "missing disclosure"
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000
const AI_POLICY_URL = "https://github.com/yazi-rs/.github/blob/main/AI_POLICY.md"

function aiSlopBody(subject, url) {
	return [
		`I'm closing this ${subject} because it violates our [AI Policy](${url}).`,
		"",
		"The policy requires human-authored descriptions that reflect your own voice and ideas. Any AI assistance must be disclosed, including the model used and the extent of assistance. Any AI-generated code must be reviewed, tested, and simplified by a human who understands the work and how it interacts with the greater system without AI assistance.",
		"",
		"Before opening a PR, you must have a thorough discussion with the maintainers in an issue about the proposed design and change and obtain their approval. We will close any PRs that we believe were created without meaningful involvement.",
	].join("\n")
}

function missingDisclosureBody(url) {
	return [
		"Thank you for taking the time to open this PR and for contributing to Yazi!",
		"",
		`For AI-assisted work, please follow our [AI Policy](${url}): disclose the model used and the extent of assistance, write the PR description in your own voice and ideas, keep a human in the loop who understands the work and how it interacts with the greater system without AI assistance, and have a human review, test, and simplify any AI-generated code.`,
		"",
		"Before opening a PR, you must have a thorough discussion with the maintainers in an issue about the proposed design and change and obtain their approval. Any AI products used must explicitly state they do not assert copyright over the work.",
		"",
		"Please update the PR description to reflect these requirements and check the corresponding item in the PR checklist.",
		"",
		"Once you have made the updates, please let us know. Otherwise, PRs with `missing disclosure` will be closed after one day of inactivity.",
	].join("\n")
}

function labeledEvents(events, label) {
	return events.filter(event => event.event === "labeled" && event.label?.name === label)
}

module.exports = async ({ github, context, core }) => {
	const url = AI_POLICY_URL

	async function getIssue(id) {
		try {
			const { data: issue } = await github.rest.issues.get({
				...context.repo,
				issue_number: id,
			})
			return issue
		} catch (e) {
			core.error(`Error getting issue #${id}: ${e.message}`)
			return null
		}
	}

	async function listEvents(id) {
		try {
			const { data: events } = await github.rest.issues.listEvents({
				...context.repo,
				issue_number: id,
				per_page: 100,
			})
			return events
		} catch (e) {
			core.error(`Error listing events for #${id}: ${e.message}`)
			return null
		}
	}

	async function createComment(id, body) {
		try {
			await github.rest.issues.createComment({
				...context.repo,
				issue_number: id,
				body,
			})
		} catch (e) {
			core.error(`Error commenting on #${id}: ${e.message}`)
		}
	}

	async function closeIssue(id) {
		try {
			await github.rest.issues.update({
				...context.repo,
				issue_number: id,
				state: "closed",
				state_reason: "not_planned",
			})
		} catch (e) {
			core.error(`Error closing #${id}: ${e.message}`)
		}
	}

	async function lockIssue(id) {
		try {
			await github.rest.issues.lock({
				...context.repo,
				issue_number: id,
			})
		} catch (e) {
			core.error(`Error locking #${id}: ${e.message}`)
		}
	}

	async function moderateAiSlop(issue) {
		const id = issue.number
		const subject = issue.pull_request ? "PR" : "issue"
		const events = await listEvents(id)
		const history = events && labeledEvents(events, AI_SLOP_LABEL)

		const current = await getIssue(id)
		if (!current) return

		if (current.state !== "closed") {
			await closeIssue(id)
		}

		if (history?.at(-1) && history.length === 1) {
			await createComment(id, aiSlopBody(subject, url))
		}

		const latest = await getIssue(id)
		if (latest && !latest.locked) {
			await lockIssue(id)
		}
	}

	async function moderateMissingDisclosure(issue) {
		const id = issue.number
		if (issue.state !== "open") return

		const events = await listEvents(id)
		const history = events && labeledEvents(events, MISSING_DISCLOSURE_LABEL)
		if (!history?.at(-1) || history.length !== 1) return

		await createComment(id, missingDisclosureBody(url))
	}

	async function closeOldPullRequests() {
		try {
			const { data: issues } = await github.rest.issues.listForRepo({
				...context.repo,
				state: "open",
				labels: MISSING_DISCLOSURE_LABEL,
				per_page: 100,
			})

			const oneDayAgo = new Date(Date.now() - DAY_IN_MILLISECONDS)

			for (const issue of issues) {
				if (!issue.pull_request) continue

				const current = await getIssue(issue.number)
				if (!current || current.state !== "open") continue
				if (!current.labels.some(label => label.name === MISSING_DISCLOSURE_LABEL)) continue
				if (new Date(current.updated_at) > oneDayAgo) continue

				await closeIssue(issue.number)
				core.info(`Closed PR #${issue.number} after 24 hours without an update`)
			}
		} catch (e) {
			core.error(`Error checking old PRs: ${e.message}`)
		}
	}

	async function main() {
		if (context.eventName === "schedule" || context.eventName === "workflow_dispatch") {
			await closeOldPullRequests()
			return
		}

		if (context.eventName === "issues" || context.eventName === "pull_request_target") {
			const issue = context.payload.issue ?? {
				...context.payload.pull_request,
				pull_request: true,
			}
			const label = context.payload.label?.name
			if (!issue) return

			if (label === AI_SLOP_LABEL) {
				await moderateAiSlop(issue)
			} else if (issue.pull_request && label === MISSING_DISCLOSURE_LABEL) {
				await moderateMissingDisclosure(issue)
			}
		}
	}

	await main()
}
