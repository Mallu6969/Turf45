import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import StationCard from '@/components/StationCard';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Plus, Target } from 'lucide-react';
import AddStationDialog from '@/components/AddStationDialog';
import PinVerificationDialog from '@/components/PinVerificationDialog';

const Stations = () => {
  const { stations } = usePOS();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openPinDialog, setOpenPinDialog] = useState(false);

  // Separate courts by type
  const turfCourts = stations.filter(station => station.type === 'turf');
  const pickleballCourts = stations.filter(station => station.type === 'pickleball');

  // Count active courts
  const activeTurf = turfCourts.filter(s => s.isOccupied).length;
  const activePickleball = pickleballCourts.filter(s => s.isOccupied).length;

  const handleAddCourtClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🎯 Add Court button clicked!');
    setOpenPinDialog(true);
  };

  const handlePinSuccess = () => {
    setOpenAddDialog(true);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between mb-6 relative z-[100]">
        <h2 className="text-3xl font-bold tracking-tight gradient-text font-heading">Court Management</h2>
        <button 
          className="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
          onClick={handleAddCourtClick}
          type="button"
        >
          <Plus className="h-4 w-4" /> Add Court
        </button>
      </div>

      {/* PIN Verification Dialog */}
      <PinVerificationDialog 
        open={openPinDialog} 
        onOpenChange={setOpenPinDialog}
        onSuccess={handlePinSuccess}
        title="Admin Access Required"
        description="Enter the admin PIN to add a new sports court"
      />

      {/* Add Station Dialog */}
      <AddStationDialog 
        open={openAddDialog} 
        onOpenChange={setOpenAddDialog} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
        <Card className="bg-gradient-to-r from-green-900/20 to-green-700/10 border-green-500/30 border animate-fade-in">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Main Turf Court</p>
              <p className="text-2xl font-bold">{activeTurf} / {turfCourts.length} Active</p>
              <p className="text-xs text-green-500 mt-1">Football & Cricket</p>
            </div>
            <div className="rounded-full bg-green-900/30 p-3">
              <Trophy className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-900/20 to-blue-700/10 border-blue-500/30 border animate-fade-in delay-100">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pickleball Court</p>
              <p className="text-2xl font-bold">{activePickleball} / {pickleballCourts.length} Active</p>
              <p className="text-xs text-blue-400 mt-1">Indoor Court</p>
            </div>
            <div className="rounded-full bg-blue-900/30 p-3">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Main Turf Section - First */}
        <div className="animate-slide-up delay-200">
          <div className="flex items-center mb-4">
            <Trophy className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-xl font-semibold font-heading">Main Turf Court</h3>
            <span className="ml-2 bg-green-800/30 text-green-400 text-xs px-2 py-1 rounded-full">
              {activeTurf} active
            </span>
            <span className="ml-2 text-xs text-gray-400">
              FIFA-approved for Football & Cricket
            </span>
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {turfCourts
              .sort((a, b) => {
                const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
                return numA - numB;
              })
              .map((station, index) => (
                <div key={station.id} className="animate-scale-in" style={{animationDelay: `${index * 100}ms`}}>
                  <StationCard station={station} />
                </div>
              ))
            }
          </div>
        </div>

        {/* Pickleball Section - Second */}
        <div className="animate-slide-up delay-300">
          <div className="flex items-center mb-4">
            <Target className="h-5 w-5 text-blue-400 mr-2" />
            <h3 className="text-xl font-semibold font-heading">Pickleball Court</h3>
            <span className="ml-2 bg-blue-800/30 text-blue-400 text-xs px-2 py-1 rounded-full">
              {activePickleball} active
            </span>
            <span className="ml-2 text-xs text-gray-400">
              Indoor court
            </span>
          </div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {pickleballCourts
              .sort((a, b) => {
                const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
                const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
                return numA - numB;
              })
              .map((station, index) => (
                <div key={station.id} className="animate-scale-in" style={{animationDelay: `${(index + turfCourts.length) * 100}ms`}}>
                  <StationCard station={station} />
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stations;
