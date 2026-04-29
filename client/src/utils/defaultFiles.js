export const initialFileSystem = {
  id: "root",
  name: "root",
  type: "folder",
  children: [
    {
      id: "src",
      name: "src",
      type: "folder",
      children: []
    }
  ]
};

export const findNode = (tree, id) => {
  if (tree.id === id) return tree;
  if (tree.children) {
    for (const child of tree.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
};

export const findParent = (tree, id, parent = null) => {
  if (tree.id === id) return parent;
  if (tree.children) {
    for (const child of tree.children) {
      const found = findParent(child, id, tree);
      if (found) return found;
    }
  }
  return null;
};

const sortChildren = (children) => {
  return children.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'folder' ? -1 : 1;
  });
};

export const addNode = (tree, parentId, newNode) => {
  const newTree = JSON.parse(JSON.stringify(tree));
  const parent = findNode(newTree, parentId);
  if (parent && parent.type === 'folder') {
    parent.children.push(newNode);
    sortChildren(parent.children);
  }
  return newTree;
};

export const deleteNode = (tree, id) => {
  if (tree.id === id) return null; // Cannot delete root easily here
  const newTree = JSON.parse(JSON.stringify(tree));
  const parent = findParent(newTree, id);
  if (parent) {
    parent.children = parent.children.filter(child => child.id !== id);
  }
  return newTree;
};

export const renameNode = (tree, id, newName) => {
  const newTree = JSON.parse(JSON.stringify(tree));
  const node = findNode(newTree, id);
  const parent = findParent(newTree, id);
  if (node) {
    node.name = newName;
  }
  if (parent) {
    sortChildren(parent.children);
  }
  return newTree;
};

export const moveNode = (tree, id, newParentId) => {
  const newTree = JSON.parse(JSON.stringify(tree));
  const nodeToMove = findNode(newTree, id);
  const oldParent = findParent(newTree, id);
  const newParent = findNode(newTree, newParentId);

  if (nodeToMove && oldParent && newParent && newParent.type === 'folder') {
    // Prevent moving a folder into itself or its children
    let current = newParent;
    let isChild = false;
    while (current) {
      if (current.id === id) {
        isChild = true;
        break;
      }
      current = findParent(newTree, current.id);
    }
    
    if (!isChild) {
      oldParent.children = oldParent.children.filter(c => c.id !== id);
      newParent.children.push(nodeToMove);
      sortChildren(newParent.children);
    }
  }
  return newTree;
};

export const updateFileContent = (tree, id, content) => {
  const newTree = JSON.parse(JSON.stringify(tree));
  const node = findNode(newTree, id);
  if (node && node.type === 'file') {
    node.content = content;
  }
  return newTree;
};

export const getAllFiles = (tree) => {
  let files = [];
  if (tree.type === 'file') files.push(tree);
  if (tree.children) {
    for (const child of tree.children) {
      files = files.concat(getAllFiles(child));
    }
  }
  return files;
};
