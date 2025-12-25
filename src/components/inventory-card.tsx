import { InventoryItem } from '../App';
import { AlertCircle, Package, Pencil, Trash2 } from 'lucide-react';

interface InventoryCardProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  isAuthenticated: boolean;
}

export function InventoryCard({ item, onEdit, onDelete, isAuthenticated }: InventoryCardProps) {
  const getStockStatus = () => {
    if (item.quantity === 0) {
      return { text: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    } else if (item.quantity <= item.reorderLevel) {
      return { text: 'Low Stock', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    }
    return { text: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
  };

  const status = getStockStatus();

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group">
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img 
          src={item.image} 
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {item.quantity <= item.reorderLevel && (
          <div className={`absolute top-2 right-2 ${status.bgColor} ${status.borderColor} border rounded-full p-2`}>
            <AlertCircle className={`w-4 h-4 ${status.color}`} />
          </div>
        )}
        
        {/* Action Buttons - Only show if authenticated */}
        {isAuthenticated && (
          <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(item)}
              className="p-2 bg-white rounded-lg shadow hover:bg-gray-100 transition-colors"
              title="Edit item"
            >
              <Pencil className="w-4 h-4 text-blue-600" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 bg-white rounded-lg shadow hover:bg-gray-100 transition-colors"
              title="Delete item"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-gray-900 mb-1">{item.name}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
            {item.category}
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">
              Qty: <span className={status.color}>{item.quantity}</span>
            </span>
          </div>
          <p className="text-gray-900">${item.price.toFixed(2)}</p>
        </div>

        <div className={`px-3 py-2 ${status.bgColor} ${status.borderColor} border rounded-lg text-center`}>
          <span className={status.color}>{status.text}</span>
        </div>
      </div>
    </div>
  );
}