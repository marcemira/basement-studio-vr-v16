// Move existing controls rather than cloning them: IDs, handlers and saved settings remain stable.
const panel = document.querySelector('#panel');
const headings = [...panel.querySelectorAll(':scope > .section-label')];
const groups = new Map();
for (const heading of headings) {
  const nodes = [heading];
  let node = heading.nextElementSibling;
  while (node && !node.classList.contains('section-label') && node.id !== 'furniture-finishes') {
    nodes.push(node); node = node.nextElementSibling;
  }
  groups.set(heading.textContent, nodes);
}
const definitions = [
  ['layout', 'Layout', ['EXPLORE', 'DESIGN THE LAYOUT', 'DESIGN THE CABINET']],
  ['position', 'Position', ['YOUR POSITION', 'VR CHECK']],
  ['tv', 'TV', ['TV & DISPLAY ROWS']],
  ['objects', 'Objects', ['MOVE INDIVIDUAL OBJECTS']],
  ['lighting', 'Lighting', ['MATERIALS & LIGHTING']],
  ['rgb', 'RGB', []],
  ['screens', 'Screens', ['SCREEN CONTENT & LIGHT']],
  ['features', 'Features', ['TRY THE FURNITURE', 'ROOM & LIGHT']],
  ['finishes', 'Finishes', []],
  ['files', 'Files & plans', []],
];
const tabs = document.createElement('div'); tabs.className = 'control-tabs'; tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Room controls');
const content = document.createElement('div'); content.className = 'control-content';
const panes = new Map();
for (const [id, label, sections] of definitions) {
  const button = document.createElement('button'); button.type = 'button'; button.id = 'tab-' + id;
  button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', 'pane-' + id); button.textContent = label;
  const pane = document.createElement('section'); pane.id = 'pane-' + id; pane.className = 'control-pane';
  pane.setAttribute('role', 'tabpanel'); pane.setAttribute('aria-labelledby', button.id); pane.tabIndex = 0;
  for (const section of sections) for (const node of groups.get(section) || []) pane.append(node);
  tabs.append(button); content.append(pane); panes.set(id, pane);
}
panel.append(content);
function move(id, destination, wrapper) {
  const control = document.getElementById(id);
  panes.get(destination).append(wrapper ? control.closest(wrapper) : control);
}
move('furniture-finishes', 'finishes');
// Match the VR organization: layout dimensions, TV rows, RGB effects and physical features.
move('desk-height', 'layout', 'label');
move('tv-size', 'tv', 'label');
for (const group of [...panes.get('layout').querySelectorAll('.features')]) {
  if (!group.querySelector('#center-cabinet')) panes.get('features').prepend(group);
}
for (const id of ['rgb-sync','rgb-effect','rgb-speed','rgb-pause','pc-brightness','shelves-brightness','room-brightness','pc-rgb','shelf-rgb','room-rgb']) {
  move(id, 'rgb', document.getElementById(id).closest('.features') ? '.features' : 'label');
}
move('display-light', 'lighting', 'label');
const files = panes.get('files');
for (const id of ['save-settings','load-settings','settings-file','construction-plans','export']) move(id, 'files');
files.append(panes.get('features').lastElementChild); // Model scale / approximation note.
for (const [id, title] of [['rgb','RGB animation'],['files','Files & plans']]) {
  const heading = document.createElement('div'); heading.className = 'section-label'; heading.textContent = title;
  panes.get(id).prepend(heading);
}
const intro = document.createElement('div'); intro.className = 'control-header';
const title = document.createElement('h1'); title.textContent = 'Room controls'; intro.append(title);
panel.replaceChildren(intro, tabs, content);
const buttons = [...tabs.children];
function activate(index, focus = false) {
  buttons.forEach((button, i) => {
    const selected = i === index;
    button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1;
    document.getElementById(button.getAttribute('aria-controls')).hidden = !selected;
  });
  content.scrollTop = 0;
  if (focus) buttons[index].focus();
}
buttons.forEach((button, index) => {
  button.addEventListener('click', () => activate(index));
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
    if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = buttons.length - 1;
    if (next !== undefined) { event.preventDefault(); activate(next, true); }
  });
});
activate(0);
