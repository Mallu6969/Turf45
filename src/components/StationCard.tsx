import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { usePOS, Station } from '@/context/POSContext';
import StationInfo from '@/components/station/StationInfo';
import StationTimer from '@/components/station/StationTimer';
import StationActions from '@/components/station/StationActions';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Tag, Trophy, Target } from 'lucide-react';
import EditStationDialog from './EditStationDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StationCardProps {
  station: Station;
}

const StationCard: React.FC<StationCardProps> = ({ station }) => {
  const { customers, startSession, endSession, deleteStation, updateStation } = usePOS();
  const isTurf = station.type === 'turf';
  const isPickleball = station.type === 'pickleball';
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const getCustomer = (id: string) => {
    return customers.find(c => c.id === id);
  };

  const customer = station.currentSession 
    ? getCustomer(station.currentSession.customerId)
    : null;
    
  const customerName = customer ? customer.name : 'Unknown Customer';
  
  const session = station.currentSession;
  const hasCoupon = session?.couponCode;
  const discountedRate = session?.hourlyRate || station.hourlyRate;
  const originalRate = session?.originalRate || station.hourlyRate;
  const isDiscounted = hasCoupon && discountedRate !== originalRate;
  const currentSport = station.currentSport || session?.sport;
    
  const handleDeleteStation = async () => {
    await deleteStation(station.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDialogOpen(true);
  };

  return (
    <>
      <Card 
        className={`
          relative overflow-hidden h-full min-h-[420px] transition-all duration-500
          ${station.isOccupied 
            ? 'border-red-500/60 shadow-2xl shadow-red-500/30 border-2' 
            : isTurf 
              ? 'border-green-500/60 shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 border-2' 
              : 'border-blue-500/60 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 border-2'
          }
          hover:scale-[1.02] cursor-pointer
        `}
      >
        {/* Realistic Court Background */}
        <div className="absolute inset-0 overflow-hidden">
          {isTurf ? (
            /* Football/Cricket Turf Ground */
            <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-600 to-green-800">
              {/* Grass texture effect */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 100, 0, 0.2) 2px,
                  rgba(0, 100, 0, 0.2) 4px
                )`
              }}></div>
              
              {/* Football field lines */}
              <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 100 60" preserveAspectRatio="none">
                {/* Outer boundary */}
                <rect x="5" y="5" width="90" height="50" fill="none" stroke="white" strokeWidth="0.5"/>
                
                {/* Center line */}
                <line x1="50" y1="5" x2="50" y2="55" stroke="white" strokeWidth="0.5"/>
                
                {/* Center circle */}
                <circle cx="50" cy="30" r="8" fill="none" stroke="white" strokeWidth="0.5"/>
                <circle cx="50" cy="30" r="0.8" fill="white"/>
                
                {/* Goal areas */}
                <rect x="5" y="18" width="8" height="24" fill="none" stroke="white" strokeWidth="0.5"/>
                <rect x="87" y="18" width="8" height="24" fill="none" stroke="white" strokeWidth="0.5"/>
                
                {/* Penalty areas */}
                <rect x="5" y="12" width="15" height="36" fill="none" stroke="white" strokeWidth="0.5"/>
                <rect x="80" y="12" width="15" height="36" fill="none" stroke="white" strokeWidth="0.5"/>
              </svg>
              
              {/* Animated grass sway */}
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
            </div>
          ) : (
            /* Pickleball Court */
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-700">
              {/* Court surface texture */}
              <div className="absolute inset-0 opacity-15" style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 10px,
                  rgba(255, 255, 255, 0.05) 10px,
                  rgba(255, 255, 255, 0.05) 11px
                )`
              }}></div>
              
              {/* Pickleball court lines */}
              <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 100 60" preserveAspectRatio="none">
                {/* Outer boundary */}
                <rect x="15" y="5" width="70" height="50" fill="none" stroke="white" strokeWidth="0.8"/>
                
                {/* Center line */}
                <line x1="50" y1="5" x2="50" y2="55" stroke="white" strokeWidth="0.6"/>
                
                {/* Service lines */}
                <line x1="15" y1="18" x2="85" y2="18" stroke="white" strokeWidth="0.6"/>
                <line x1="15" y1="42" x2="85" y2="42" stroke="white" strokeWidth="0.6"/>
                
                {/* Kitchen (non-volley zone) */}
                <line x1="15" y1="23" x2="85" y2="23" stroke="white" strokeWidth="0.6" strokeDasharray="2,2"/>
                <line x1="15" y1="37" x2="85" y2="37" stroke="white" strokeWidth="0.6" strokeDasharray="2,2"/>
                
                {/* Center service lines */}
                <line x1="50" y1="18" x2="50" y2="42" stroke="white" strokeWidth="0.6"/>
              </svg>
              
              {/* Animated court shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-pulse" style={{ animationDuration: '4s' }}></div>
            </div>
          )}
          
          {/* Semi-dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"></div>
          
          {/* Extra dark overlay for occupied courts */}
          {station.isOccupied && (
            <div className="absolute inset-0 bg-black/30"></div>
          )}
        </div>

        {/* Coupon Badge */}
        {station.isOccupied && hasCoupon && (
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-2xl animate-pulse border-2 border-white"
               style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            <Tag className="h-4 w-4" />
            {session.couponCode}
          </div>
        )}

        {/* Sport Badge for Turf */}
        {isTurf && currentSport && (
          <div className="absolute top-4 left-4 z-30 bg-white/30 backdrop-blur-md text-white text-sm font-bold px-4 py-2 rounded-full border-2 border-white/50 shadow-xl" 
               style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {currentSport === 'football' ? '⚽ Football' : '🏏 Cricket'}
          </div>
        )}

        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isTurf ? (
                <div className="w-12 h-12 rounded-full bg-green-500/30 backdrop-blur-md flex items-center justify-center border-2 border-white shadow-lg">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500/30 backdrop-blur-md flex items-center justify-center border-2 border-white shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)' }}>
                  {station.name}
                </h3>
                <p className="text-sm text-white font-medium" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  {isTurf ? 'FIFA-Approved Turf' : 'Indoor Court'}
                </p>
              </div>
            </div>
            
            {/* Status badge */}
            <div className={`
              px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md border-2 shadow-xl
              ${station.isOccupied 
                ? 'bg-red-500/40 text-white border-white animate-pulse' 
                : 'bg-green-500/40 text-white border-white'
              }
            `}
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {station.isOccupied ? '🔴 IN USE' : '🟢 AVAILABLE'}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative z-10">
          {/* Session Info or Rate */}
          {station.isOccupied && station.currentSession ? (
            <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border-2 border-white/30 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white text-base font-medium" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  Playing:
                </span>
                <span className="text-white text-lg font-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  {customerName}
                </span>
              </div>
              
              <StationTimer session={station.currentSession} />
              
              {isDiscounted && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-orange-300" />
                  <span className="text-white font-medium">Rate:</span>
                  <span className="line-through text-white/70">₹{originalRate}</span>
                  <span className="text-orange-300 font-bold text-base">₹{discountedRate}/hr</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-5 border-2 border-white/40 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-white text-lg font-semibold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                  Hourly Rate
                </span>
                <span className="text-4xl font-black text-white" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.8)' }}>
                  ₹{station.hourlyRate}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="default"
              onClick={handleEditClick}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 backdrop-blur-md font-semibold text-base shadow-lg"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
            >
              <Edit2 className="h-5 w-5 mr-2" />
              Edit
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="default"
                  className="flex-1 bg-red-500/30 hover:bg-red-500/40 text-white border-2 border-red-400/50 backdrop-blur-md font-semibold text-base shadow-lg disabled:opacity-50"
                  disabled={station.isOccupied}
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Court?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{station.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteStation}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>

        <CardFooter className="pt-4 pb-6 relative z-10">
          <StationActions
            station={station}
            customers={customers}
            onStartSession={startSession}
            onEndSession={endSession}
          />
        </CardFooter>
      </Card>

      <EditStationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        station={station}
        onSave={updateStation}
      />
    </>
  );
};

export default StationCard;
