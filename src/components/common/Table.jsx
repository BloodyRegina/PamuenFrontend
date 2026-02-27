import React from 'react';

const Table = ({ headers, data, renderRow, className = '' }) => {
    return (
        <div className={`overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-100 ${className}`}>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                        {headers.map((header, idx) => (
                            <th
                                key={idx}
                                className="px-6 py-4 text-sm font-semibold text-slate-600 whitespace-nowrap"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.length > 0 ? (
                        data.map((item, idx) => renderRow(item, idx))
                    ) : (
                        <tr>
                            <td colSpan={headers.length} className="px-6 py-8 text-center text-slate-500">
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
