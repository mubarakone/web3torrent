'use client'

import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation';
import { Loader2, Upload, Download, Shield, DollarSign, Music, Zap } from 'lucide-react';

const roles = [
  {
    id: 'publisher',
    title: 'Publisher',
    icon: Upload,
    description: 'Create and license your content',
    features: [
      'Upload content with torrent magnet links',
      'Set flexible pricing (fixed or auction)',
      'Earn licensing fees from distributors',
      'Track content performance and revenue',
      'Automated copyright protection'
    ],
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
  },
  {
    id: 'distributor',
    title: 'Distributor',
    icon: Download,
    description: 'License and distribute content across platforms',
    features: [
      'Purchase content licenses',
      'Distribute to YouTube, Spotify, etc.',
      'Earn ad revenue from platforms',
      'Get P2P rebates for seeding',
      'Register platform publications'
    ],
    color: 'bg-green-50 border-green-200 hover:bg-green-100'
  },
  {
    id: 'hunter',
    title: 'Bounty Hunter',
    icon: Shield,
    description: 'Protect creators by finding unauthorized content',
    features: [
      'Scan platforms for pirated content',
      'Submit zkTLS proofs for takedowns',
      'Earn bounty rewards for verified finds',
      'Help protect creator rights',
      'Flexible work schedule'
    ],
    color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
  }
]

export default function RegistrationPage() {
  const [selectedRole, setSelectedRole] = useState()
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId)
  }

  const handleRegisterClick = async () => {
    if (!selectedRole) {
      alert('Please select a role first');
      return;
    }

    setLoading(true);
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    // Navigate based on role
    switch (selectedRole) {
      case 'publisher':
        router.push('/PublisherDashboard');
        break;
      case 'distributor':
        router.push('/ProviderDashboard');
        break;
      case 'hunter':
        router.push('/BountyHunterDashboard');
        break;
      default:
        alert('Invalid role selection');
        setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Setting up your dashboard...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Music className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-900">Web3Torrent</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">Decentralized Content Licensing & Distribution Platform</p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Choose your role to get started with incentivized P2P content sharing, 
            automated copyright protection, and transparent revenue distribution.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <Card 
                key={role.id}
                className={`cursor-pointer transition-all duration-200 ${role.color} ${
                  isSelected ? 'ring-2 ring-blue-500 shadow-lg scale-105' : 'hover:shadow-md'
                }`}
                onClick={() => handleRoleSelect(role.id)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-2">
                    <Icon className={`h-12 w-12 ${
                      role.id === 'publisher' ? 'text-blue-600' :
                      role.id === 'distributor' ? 'text-green-600' : 'text-purple-600'
                    }`} />
                  </div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <Zap className="h-3 w-3 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {isSelected && (
                    <div className="mt-4 p-3 bg-white rounded-lg border">
                      <p className="text-xs text-gray-500 font-medium">SELECTED</p>
                      <p className="text-sm font-semibold text-gray-700">Ready to continue as {role.title}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            onClick={handleRegisterClick}
            disabled={!selectedRole || loading}
            size="lg"
            className="px-8 py-3 text-lg font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Setting up...
              </>
            ) : selectedRole ? (
              `Continue as ${roles.find(r => r.id === selectedRole)?.title}`
            ) : (
              'Select a Role to Continue'
            )}
          </Button>
          
          {selectedRole && !loading && (
            <p className="text-sm text-gray-500 mt-3">
              You'll be redirected to your {roles.find(r => r.id === selectedRole)?.title.toLowerCase()} dashboard
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-xs text-gray-400">
          <p>Built on Ethereum • Powered by WebTorrent • Protected by zkTLS</p>
        </div>
      </div>
    </div>
  );
}