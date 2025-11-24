import { translate } from '@/Helpers';
import 'chart.js/auto';
import { useEffect } from 'react';
import { Chart } from 'react-chartjs-2';

export const BarChart = ({ data, totals, className }) => {

    const options = {
        backgroundColor:'transparent',
        plugins: {
            title: {
                display: false,
            },
            legend: {
                display: false,
            }
        },
        responsive: true,
        interaction: {
            intersect: true,
        },
        // barPercentage: 0.5,
        scales: {
            x: {
                grid:{
                    display: false,
                },
            },
            y: {
                grid: {
                    display: true,
                    borderDash: [2,2]
                },
            },
        },
    };
    const labels = data.labels;

    const chartData = {
        labels,
        datasets: [{
            label: 'Total Views',
            backgroundColor: '#041E4F',
            borderRadius: 5,
            data: data.visits,
            borderSkipped: false
        },{
            label: 'Total Shares',
            backgroundColor: '#df2351',
            borderRadius: 5,
            data: data.shares,
            borderSkipped: false
        },{
            label: 'Total Scans',
            backgroundColor: 'rgb(2, 173, 193)',
            borderRadius: 5,
            data: data.scans,
            borderSkipped: false
        }]
    };

    return (
        <div className={`w-100 ${className}`}>
            <div className='d-flex fs-sm text-black fw-bold justify-content-center align-items-center'>
                <div className='d-md-flex d-block me-md-2 me-3 text-center align-items-center justify-content-center'><div style={styles.totalViews}></div><span className='ps-md-1 ps-0'>{totals.views} {translate('Views')}</span></div>
                <div className='d-md-flex d-inline me-md-2 me-3 align-items-center justify-content-center'><div style={styles.totalShares}></div><span className='ps-md-1 ps-0'>{totals.shares} {translate('Shares')}</span></div>
                <div className='d-md-flex d-inline align-items-center justify-content-center'><div style={styles.totalScans}></div><span className='ps-md-1 ps-0'>{totals.scans} {translate('Scans')}</span></div>
            </div>
            <Chart className={`${className}`} type='bar' data={chartData} options={options}/>
        </div>
    );
};

const styles = {
    totalViews: {
        backgroundColor: '#041E4F',
        width: '40px',
        height: '11px',
        margin: '0 auto',
    },
    totalShares: {
        backgroundColor: '#df2351',
        width: '40px',
        height: '11px',
        margin: '0 auto',
    },
    totalScans: {
        backgroundColor: 'rgb(2, 173, 193)',
        width: '40px',
        height: '11px',
        margin: '0 auto',
    }
}