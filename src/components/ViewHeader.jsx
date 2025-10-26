/* 
--  function ViewHeader({ title, children }): We're defining a new component that accepts two props: title and children.
--  title: This will be the text we want to display in the <h2> tag, like "Territory #1-7" or "Main St". The {title && <h2>{title}</h2>} part 
    is a safety check; it only renders the h2 if a title is actually provided.
--  children: This is a special, built-in prop in React. It refers to whatever you put between the opening and closing tags when you use the 
    component. In our case, this is where we'll put our action buttons.
--  The JSX Structure: This is the exact same HTML structure we just manually created in the other files. It has the h2 on top, followed by 
    the view-header and header-actions divs. Our children (the buttons) will be rendered right inside header-actions.
 */

function ViewHeader({ title, children }) {
  return (
    <>
      {title && <h2>{title}</h2>}
      <div className="view-header">
        <div className="header-actions">
          {children}
        </div>
      </div>
    </>
  );
}

export default ViewHeader;