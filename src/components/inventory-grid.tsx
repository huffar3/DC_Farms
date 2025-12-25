import { InventoryItem } from '../App';
import { InventoryCard } from './inventory-card';

interface InventoryGridProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  isAuthenticated: boolean;
}

export function InventoryGrid({ items, onEdit, onDelete, isAuthenticated }: InventoryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(item => (
        <InventoryCard 
          key={item.id} 
          item={item} 
          onEdit={onEdit}
          onDelete={onDelete}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
}