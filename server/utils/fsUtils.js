import fs from 'fs/promises';
import path from 'path';

/**
 * Helper to generate a unique ID for fileTree nodes
 */
const generateId = () => Math.random().toString(36).substring(2, 9);

/**
 * Recursively reads a directory and builds a fileTree JSON structure.
 * Ignored directories: .git, node_modules
 * 
 * @param {string} dirPath - The local path to read
 * @param {string} name - The name of the node (default 'root')
 * @param {string} rootPath - The absolute root path of the project to calculate relative paths if needed
 * @returns {object} - The node structure
 */
export const buildTreeFromDisk = async (dirPath, name = 'root', rootPath = dirPath) => {
  const stats = await fs.stat(dirPath);
  
  if (stats.isDirectory()) {
    const node = {
      id: name === 'root' ? 'root' : generateId(),
      name,
      type: 'folder',
      children: [],
    };

    const items = await fs.readdir(dirPath);

    for (const item of items) {
      // Ignore git and node_modules
      if (item === '.git' || item === 'node_modules') continue;

      const itemPath = path.join(dirPath, item);
      const childNode = await buildTreeFromDisk(itemPath, item, rootPath);
      node.children.push(childNode);
    }
    
    // Sort: folders first, then files alphabetically
    node.children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });

    return node;
  } else {
    // It's a file
    const content = await fs.readFile(dirPath, 'utf8');
    return {
      id: generateId(),
      name,
      type: 'file',
      content,
    };
  }
};

/**
 * Recursively syncs a JSON fileTree back to the local disk.
 * 
 * @param {object} node - The fileTree node
 * @param {string} currentPath - The current directory path being written to
 */
export const syncTreeToDisk = async (node, currentPath) => {
  if (node.type === 'folder') {
    // Don't create the root folder itself inside the target, just its children
    const dirPath = node.name === 'root' ? currentPath : path.join(currentPath, node.name);
    
    if (node.name !== 'root') {
      await fs.mkdir(dirPath, { recursive: true });
    }

    if (node.children) {
      for (const child of node.children) {
        await syncTreeToDisk(child, dirPath);
      }
    }
  } else if (node.type === 'file') {
    const filePath = path.join(currentPath, node.name);
    await fs.writeFile(filePath, node.content || '', 'utf8');
  }
};
