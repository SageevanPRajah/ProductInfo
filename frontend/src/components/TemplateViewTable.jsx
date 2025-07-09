import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  AiOutlineFileSearch, 
  AiOutlineEdit, 
  AiOutlineDelete,
  AiOutlineSnippets  
} from "react-icons/ai";

// Helper function: Build breadcrumb string using the full template list.
const buildBreadcrumb = (template, allTemplates) => {
  let breadcrumb = template.name;
  let currentParentId = template.parentTemplate;
  
  // Loop until there is no parent.
  while (currentParentId) {
    // Find the parent template in the full list
    const parentItem = allTemplates.find(
      (item) => item.template._id.toString() === currentParentId.toString()
    );
    if (parentItem) {
      // Prepend parent's name to the breadcrumb (using ">" as delimiter)
      breadcrumb = `${parentItem.template.name} > ${breadcrumb}`;
      // Move upward in the chain
      currentParentId = parentItem.template.parentTemplate;
    } else {
      // Break out if the parent is not found
      break;
    }
  }
  return breadcrumb;
};

const TemplateViewTable = ({ templates = [], onDelete, allTemplates = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 space-y-3">
      {templates.map((template, index) => (
        <div
          key={index}
          className="flex items-center justify-between px-4 py-3 rounded-md bg-gray-200 hover:bg-gray-300 transition-all"
        >
          {/* If the template has a parent, build and display the breadcrumb */}
          <div className="text-gray-800 font-medium">
            {template.parentTemplate 
              ? buildBreadcrumb(template, allTemplates)
              : template.name
            }
          </div>
          <div className="flex items-center gap-4">
            <button
              className="text-green-600 hover:text-green-800"
              onClick={() => navigate(`/templates/${template._id}`)}
              title="View"
            >
              <AiOutlineFileSearch size={20} />
            </button>
            
            
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplateViewTable;
