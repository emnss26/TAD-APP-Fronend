import React, { useRef, useState, useEffect } from 'react';
import { ResponsiveBar } from '@nivo/bar';

const RoleUsersChart = ({ roleCounts, onRoleClick }) => {
    const chartContainerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 400, height: 350 });

    // Actualizar las dimensiones del contenedor
    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });

        if (chartContainerRef.current) {
            resizeObserver.observe(chartContainerRef.current);
        }

        return () => {
            if (chartContainerRef.current) {
                resizeObserver.unobserve(chartContainerRef.current);
            }
        };
    }, []);

    const maxRoles = roleCounts.length > 0 ? Math.max(...roleCounts.map((r) => r.value)) : 0;

    const tickStep = maxRoles <= 20 ? 1 : 10;
    const tickValues = Array.from(
        { length: Math.ceil(maxRoles / tickStep) + 1 },
        (_, i) => i * tickStep
    );

    return (
        <div
            ref={chartContainerRef}
            style={{
                height: '100%',
                width: '100%',
                position: 'relative',
            }}
        >
            {dimensions.width && dimensions.height && (
                <ResponsiveBar
                    data={Array.isArray(roleCounts) ? roleCounts : []}
                    keys={['value']}
                    indexBy="id"
                    margin={{ top: 3, right: 3, bottom: 25, left: 150 }}
                    padding={0.3}
                    layout="horizontal"
                    colors={['#2ea3e3']}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 4,
                        tickPadding: 5,
                        tickRotation: 0,
                        tickValues: tickValues,
                        legend: '',
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                    }}
                    enableGridX={true}
                    enableGridY={false}
                    height={350} // Ajustar la altura dinámicamente
                    tooltip={({ id, value }) => (
                        <div
                            style={{
                                padding: '5px 10px',
                                background: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                borderRadius: '1px',
                            }}
                        >
                            <strong>{id}</strong>: {value}
                        </div>
                    )}
                    onClick={(node) => {
                        if (onRoleClick) {
                            onRoleClick(node.indexValue); // Usar `id` como el identificador del rol
                        }
                    }}
                />
            )}
        </div>
    );
};

export default RoleUsersChart;