// components/charts.jsx
import React from 'react'
import { 
  BarChart as RechartsBarChart, 
  LineChart as RechartsLineChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function BarChart({ data, index, categories, colors, valueFormatter, className, title }) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RechartsBarChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={index} />
            <YAxis />
            <Tooltip 
              formatter={(value) => valueFormatter ? valueFormatter(value) : value}
            />
            {categories.map((category, i) => (
              <Bar 
                key={category} 
                dataKey={category} 
                fill={colors && colors[i] ? getColor(colors[i]) : '#3b82f6'} 
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function LineChart({ data, index, categories, colors, valueFormatter, className, title }) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RechartsLineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={index} />
            <YAxis />
            <Tooltip 
              formatter={(value) => valueFormatter ? valueFormatter(value) : value}
            />
            {categories.map((category, i) => (
              <Line 
                key={category}
                type="monotone" 
                dataKey={category} 
                stroke={colors && colors[i] ? getColor(colors[i]) : '#3b82f6'}
                strokeWidth={2}
                dot={{ fill: colors && colors[i] ? getColor(colors[i]) : '#3b82f6' }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Helper function to convert color names to hex values
function getColor(colorName) {
  const colorMap = {
    blue: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
    yellow: '#f59e0b',
    purple: '#8b5cf6',
    pink: '#ec4899',
    indigo: '#6366f1',
    gray: '#6b7280'
  }
  
  return colorMap[colorName] || colorName
}