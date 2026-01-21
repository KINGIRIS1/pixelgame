
import React, { useState } from 'react';
import { Settings, Map, Backpack, X } from 'lucide-react';

interface Props {
  playerName: string;
  level: number;
  health: number;
  maxHealth: number;
  activeModal: string | null;
  onToggleModal: (name: string) => void;
}

// Giả lập dữ liệu túi đồ vì UI hiện tại chưa nhận prop inventory trực tiếp từ Canvas loop
// Trong thực tế bạn sẽ truyền inventory[] qua props từ App.tsx -> GameUI.tsx
const MOCK_INVENTORY = [
  { id: 1, icon: '🗡️', name: 'Kiếm Gỗ', qty: 1 },
  { id: 2, icon: '🧪', name: 'Bình Máu', qty: 5 },
  { id: 3, icon: '💰', name: 'Vàng', qty: 150 },
  { id: 4, icon: '🛡️', name: 'Khiên Cũ', qty: 1 },
];

const GameUI: React.FC<Props> = ({ playerName, level, health, maxHealth, activeModal, onToggleModal }) => {
  const healthPercent = (health / maxHealth) * 100;

  const renderModal = () => {
    if (!activeModal) return null;

    let content = null;
    let title = "";

    switch (activeModal) {
      case 'map':
        title = "Bản Đồ Thế Giới";
        content = (
          <div className="w-full h-64 bg-green-800 relative border-2 border-black rounded overflow-hidden">
             {/* Map Mockup */}
             <div className="absolute inset-0 opacity-30 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e0/Terrian_Map.jpg')] bg-cover"></div>
             <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white rounded-full border-2 border-red-500 transform -translate-x-1/2 -translate-y-1/2 animate-pulse z-10"></div>
             <div className="p-2 text-xs text-white bg-black/50 absolute top-0 left-0">Khu vực: Rừng Chết</div>
          </div>
        );
        break;
      case 'bag':
        title = "Túi Đồ";
        content = (
          <div className="grid grid-cols-5 gap-2">
            {/* Hiển thị slot đồ (20 slots) */}
            {[...Array(20)].map((_, i) => {
              const item = MOCK_INVENTORY[i];
              return (
                <div key={i} className="w-12 h-12 bg-black/60 border border-[#8D6E63] rounded hover:bg-white/10 flex flex-col items-center justify-center cursor-pointer relative group">
                   {item ? (
                     <>
                       <span className="text-2xl">{item.icon}</span>
                       <span className="absolute bottom-0 right-1 text-[10px] font-bold text-white shadow-black drop-shadow-md">{item.qty}</span>
                       {/* Tooltip */}
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-50 border border-white/20">
                          {item.name}
                       </div>
                     </>
                   ) : (
                     <span className="text-white/10 text-xs">{i+1}</span>
                   )}
                </div>
              );
            })}
          </div>
        );
        break;
      case 'settings':
        title = "Cài Đặt";
        content = (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Âm thanh</span> <input type="checkbox" defaultChecked /></div>
            <div className="flex justify-between"><span>Nhạc nền</span> <input type="checkbox" defaultChecked /></div>
            <div className="flex justify-between"><span>Hiển thị FPS</span> <input type="checkbox" /></div>
            <button className="w-full bg-red-600 py-1 mt-4 rounded text-white hover:bg-red-500 font-bold border-b-4 border-red-800 active:border-0 active:mt-5">THOÁT GAME</button>
          </div>
        );
        break;
       case 'profile':
        title = "Thông Tin";
        content = (
          <div className="flex gap-4">
             <div className="w-20 h-20 bg-gray-700 border-2 border-yellow-600 rounded">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${playerName}`} className="w-full h-full"/>
             </div>
             <div className="text-sm space-y-1">
                <p>Tên: <span className="text-yellow-400 font-bold">{playerName}</span></p>
                <p>Class: <span className="text-blue-400">Hiệp Sĩ</span></p>
                <p>Cấp độ: {level}</p>
                <div className="w-full bg-gray-900 h-2 rounded mt-2">
                   <div className="bg-green-500 h-full w-[45%] rounded"></div>
                </div>
                <p className="text-[10px] text-gray-400 text-right">XP: 450/1000</p>
             </div>
          </div>
        );
        break;
    }

    return (
      <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center p-4 pointer-events-auto animate-fadeIn" onClick={() => onToggleModal('')}>
        <div className="bg-[#3E2723] border-4 border-[#5D4037] p-1 rounded-lg w-full max-w-sm text-white shadow-2xl relative transform scale-100" onClick={e => e.stopPropagation()}>
           <div className="border-2 border-[#8D6E63] border-dashed p-4 rounded bg-[#4E342E]">
              <div className="flex justify-between items-center mb-4 border-b-2 border-[#8D6E63] pb-2">
                <h2 className="text-lg font-bold text-[#FFD54F] uppercase pixel-font tracking-widest">{title}</h2>
                <button onClick={() => onToggleModal('')} className="hover:text-red-400 transition-colors"><X size={24}/></button>
              </div>
              {content}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-4 font-sans select-none">
      {renderModal()}
      
      {/* Player Stats Widget */}
      <div className="flex items-start gap-3 pointer-events-auto cursor-pointer group" onClick={() => onToggleModal('profile')}>
        <div className="relative group-hover:scale-105 transition-transform duration-200">
          <div className="w-16 h-16 bg-gray-800 rounded-lg border-2 border-[#FFD54F] overflow-hidden shadow-lg">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${playerName}`} alt="avatar" className="w-full h-full bg-[#2c1e19]" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#D32F2F] text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border border-black shadow z-10">
            {level}
          </div>
        </div>
        
        <div className="flex flex-col gap-1 mt-1">
          <div className="bg-black/60 px-3 py-0.5 rounded-full text-white text-sm font-bold border border-white/10 backdrop-blur-md self-start">
            {playerName}
          </div>
          {/* Health Bar */}
          <div className="w-40 h-5 bg-gray-900 rounded border border-gray-600 relative overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-red-800 to-red-500 transition-all duration-300" 
              style={{ width: `${healthPercent}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-[10px] text-white font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                  {Math.floor(health)} / {maxHealth}
               </span>
            </div>
          </div>
          {/* Mana Bar */}
           <div className="w-32 h-3 bg-gray-900 rounded border border-gray-600 relative overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-blue-800 to-blue-400 w-3/4"></div>
          </div>
        </div>
      </div>

      {/* Menu Buttons */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-3 pointer-events-auto">
        <div className="flex gap-2">
           <button onClick={() => onToggleModal('map')} className="w-10 h-10 bg-[#3E2723] rounded flex items-center justify-center border-2 border-[#8D6E63] hover:bg-[#5D4037] text-[#FFD54F] shadow-lg active:translate-y-1"><Map size={20}/></button>
           <button onClick={() => onToggleModal('bag')} className="w-10 h-10 bg-[#3E2723] rounded flex items-center justify-center border-2 border-[#8D6E63] hover:bg-[#5D4037] text-[#FFD54F] shadow-lg active:translate-y-1 relative">
             <Backpack size={20}/>
             {/* Notification Dot */}
             <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-black"></span>
           </button>
           <button onClick={() => onToggleModal('settings')} className="w-10 h-10 bg-[#3E2723] rounded flex items-center justify-center border-2 border-[#8D6E63] hover:bg-[#5D4037] text-[#FFD54F] shadow-lg active:translate-y-1"><Settings size={20}/></button>
        </div>
        
        {/* Mini Map */}
        <div className="w-36 h-36 bg-[#2E7D32] border-4 border-[#3E2723] rounded shadow-2xl relative overflow-hidden hidden sm:block opacity-90 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => onToggleModal('map')}>
           <div className="absolute w-2 h-2 bg-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-sm border border-black animate-pulse z-10"></div>
           <div className="absolute inset-0 flex items-center justify-center text-white/20 font-bold text-2xl select-none">MAP</div>
           <div className="absolute bottom-1 right-2 text-[10px] text-white font-bold drop-shadow-md bg-black/30 px-1 rounded">Rừng Chết</div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-full flex items-end justify-between mt-auto relative mb-24 sm:mb-0">
         <div className="pointer-events-auto w-72 bg-black/60 p-2 rounded-lg border border-white/10 backdrop-blur-sm hidden sm:block">
            <div className="h-24 overflow-y-auto text-xs text-white space-y-1.5 pixel-font opacity-90 scrollbar-hide p-1">
              <p className="text-yellow-400 drop-shadow-sm"><span className="font-bold">[Hệ thống]</span>: Chào mừng đến với Pixel RPG VN!</p>
              <p className="text-red-400 drop-shadow-sm"><span className="font-bold">[Cảnh báo]</span>: Boss Goblin đã xuất hiện (45, 12)</p>
              <p className="text-blue-300"><span className="font-bold text-white">[Thế giới] Hunter:</span> Ai đi dun 50 không pm!</p>
            </div>
            <div className="flex mt-2 gap-1">
              <input type="text" className="w-full bg-black/40 border border-white/20 text-white text-xs px-2 py-1 rounded outline-none focus:border-yellow-500 transition-colors" placeholder="Nhấn Enter để chat..." />
              <button className="bg-blue-700 text-white text-xs px-3 py-1 rounded hover:bg-blue-600 font-bold uppercase">Gửi</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default GameUI;
