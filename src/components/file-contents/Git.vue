<template>
  <div class="file-content flex">
    <!-- Line numbers -->
    <div class="line-numbers py-4 pr-2 text-right text-gray-500 select-none">
      <div v-for="n in 20" :key="n" class="text-xs px-2">{{ n }}</div>
    </div>

    <!-- File content -->
    <div class="code-content py-4 pl-4">
      <pre class="font-mono whitespace-pre">
# Git Commands

## Basic Commands
- git init: Initialize a repository
- git add: Add files to staging area
- git commit: Record changes
- git status: Check repository status
- git log: View commit history

## Branch Operations
- git branch: List, create, or delete branches
- git checkout: Switch branches
- git merge: Merge branches
- git rebase: Reapply commits on another branch

## Remote Repository
- git remote: Manage remote repositories
- git pull: Fetch and merge changes
- git push: Upload local changes
- git fetch: Download objects and refs
- git clone: Copy a repository
      </pre>
    </div>
  </div>
</template>
