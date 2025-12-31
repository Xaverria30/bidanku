import { useState, useEffect } from 'react';
import './PilihPasienModal.css';
import pasienService from '../../services/pasien.service';

function PilihPasienModal({ show, onClose, onSelect }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [pasienList, setPasienList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (show) {
            fetchPasienList();
            setSearchQuery(''); // Reset search when opened
        }
    }, [show]);

    const fetchPasienList = async (search = '') => {
        setIsLoading(true);
        try {
            const response = await pasienService.getAllPasien(search);
            if (response.success) {
                setPasienList(response.data);
            } else {
                setPasienList([]);
            }
        } catch (error) {
            console.error('Error fetching pasien:', error);
            setPasienList([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        // Debounce could be added here, but for simplicity call directly
        fetchPasienList(value);
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Pilih Data Pasien</h3>
                    <button className="btn-close-modal" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="search-box-modal">
                        <input
                            type="text"
                            className="search-input-modal"
                            placeholder="Cari nama atau NIK pasien..."
                            value={searchQuery}
                            onChange={handleSearch}
                            autoFocus
                        />
                    </div>

                    <div className="pasien-list-modal">
                        {isLoading ? (
                            <div className="loading-modal">Memuat data...</div>
                        ) : pasienList.length > 0 ? (
                            pasienList.map(pasien => (
                                <div key={pasien.id_pasien} className="pasien-item-modal">
                                    <div className="pasien-info-modal">
                                        <h4>{pasien.nama}</h4>
                                        <p>NIK: {pasien.nik || pasien.NIK}</p>
                                        <p>Umur: {pasien.umur} Th | Alamat: {pasien.alamat}</p>
                                    </div>
                                    <button
                                        className="btn-pilih-pasien"
                                        onClick={() => onSelect(pasien)}
                                    >
                                        Pilih
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-modal">
                                {searchQuery ? 'Pasien tidak ditemukan.' : 'Belum ada data pasien.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PilihPasienModal;
