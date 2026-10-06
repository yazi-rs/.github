# Contributing to Yazi projects

Thank you for your interest in contributing to Yazi! We welcome contributions in the form of bug reports, feature requests, documentation improvements, and code changes.

## Table of Contents

1. [How to Contribute](#how-to-contribute)
2. [Pull Requests](#pull-requests)
3. [AI Policy](#ai-policy)

## How to Contribute

### Reporting Bugs

If you encounter a bug and can reliably reproduce it, please file a bug report with a minimal reproducer. Include the repository version, environment details, expected behavior, actual behavior, and relevant logs or configuration.

### Suggesting Features

If you want to request a feature, please search existing issues and discussions before submitting it. Explain the use case, the expected behavior, and why the change is necessary.

### Improving Documentation

Documentation improvements are welcome. Make documentation changes in the [Yazi documentation repository](https://github.com/yazi-rs/yazi-rs.github.io), and keep examples and instructions synchronized with the current behavior.

### Submitting Code Changes

1. Create a new branch for your changes:

   ```sh
   git checkout -b your-branch-name
   ```

2. Make your changes. Follow the target repository's coding style and run its formatter, linter, and tests when applicable.
3. Commit your changes with a descriptive commit message:

   ```sh
   git commit -m "feat: an awesome feature"
   ```

4. Push your changes to your fork:

   ```sh
   git push origin your-branch-name
   ```

## Pull Requests

If you have an idea, before raising a pull request, we encourage you to file an issue to propose it, ensuring that we are aligned and reducing the risk of re-work.

We want you to succeed, and it can be discouraging to find that a lot of re-work is needed.

### Process

1. Ensure your fork is up-to-date with the upstream repository:

   ```sh
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. Rebase your feature branch onto the `main` branch:

   ```sh
   git checkout your-branch-name
   git rebase main
   ```

3. Create a pull request to the `main` branch of the upstream repository. Follow the pull request template and ensure that:
   - Your changes pass the target repository's relevant checks.
   - Your pull request description clearly explains the changes and why they are needed.
4. Address any review comments. Make sure to push updates to the same branch on your fork.

## AI Policy

This reposistory follows the [Yazi AI Policy](https://github.com/yazi-rs/.github/blob/main/AI_POLICY.md).
