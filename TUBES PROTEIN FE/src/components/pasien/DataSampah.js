import { useState, useEffect } from 'react';
import Sidebar from '../shared/Sidebar';
import './DataPasien.css'; // Reuse styles
import pinkLogo from '../../assets/images/pink-logo.png';
import pasienService from '../../services/pasien.service';

function DataSampah({
    onBack,
    onToRiwayatDataMasuk,
    onToRiwayatMasukAkun,
    onToProfil,
    onToTambahPasien,
    onToTambahPengunjung,
    onToBuatLaporan,
    onToPersalinan,
    onToANC,
    onToKB,
    onToImunisasi
}) {
    const [pasienList, setPasienList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchDeletedPasienList();
    }, []);

    const fetchDeletedPasienList = async (search = '') => {
        setIsLoading(true);
        try {
            const response = await pasienService.getDeletedPasien(search);
            if (response.success) {
                setPasienList(response.data);
            }
        } catch (error) {
            console.error('Error fetching deleted pasien:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        fetchDeletedPasienList(value);
    };

    const handleRestore = async (pasienId) => {
        if (window.confirm('Apakah Anda yakin ingin memulihkan (restore) data pasien ini?')) {
            try {
                const response = await pasienService.restorePasien(pasienId);
                if (response.success) {
                    alert('Data pasien berhasil dipulihkan');
                    fetchDeletedPasienList(searchQuery);
                }
            } catch (error) {
                console.error('Error restoring pasien:', error);
                alert('Gagal memulihkan data pasien');
            }
        }
    };

    return (
        <div className="data-pasien-page">
            {/* Header */}
            <div className="data-pasien-header">
                <div className="dp-header-left">
                    <div className="dp-header-logo">
                        <img src={pinkLogo} alt="Pink Logo" className="dp-header-logo-img" />
                    </div>
                    <h1 className="dp-header-title">Data Sampah (Recovery)</h1>
                </div>
                <button className="btn-kembali-dp" onClick={onBack}>Kembali</button>
            </div>

            {/* Konten Utama */}
            <div className="data-pasien-content">
                {/* Sidebar */}
                <Sidebar
                    activePage="data-pasien"
                    onRiwayatDataMasuk={onToRiwayatDataMasuk}
                    onRiwayatMasukAkun={onToRiwayatMasukAkun}
                    onProfilSaya={onToProfil}
                    onTambahPasien={onToTambahPasien}
                    onTambahPengunjung={onToTambahPengunjung}
                    onBuatLaporan={onToBuatLaporan}
                    onToPersalinan={onToPersalinan}
                    onToANC={onToANC}
                    onToKB={onToKB}
                    onToImunisasi={onToImunisasi}
                />

                {/* Area Utama */}
                <main className="dp-main-area">
                    <div className="dp-card">
                        <div className="dp-card-header">
                            <h2 className="dp-card-title">Data Pasien Terhapus</h2>
                        </div>

                        <div className="dp-card-body">
                            {/* Kotak Pencarian */}
                            <div className="dp-search-container">
                                <input
                                    type="text"
                                    className="dp-search-input"
                                    placeholder="Cari Data Terhapus"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                            </div>

                            {/* Daftar Pasien */}
                            <div className="dp-patient-list">
                                {isLoading ? (
                                    <div className="dp-loading">Memuat data...</div>
                                ) : pasienList.length > 0 ? (
                                    pasienList.map((pasien) => (
                                        <div key={pasien.id_pasien} className="dp-patient-item">
                                            <div className="dp-patient-info">
                                                <span className="dp-patient-name">{pasien.nama}</span>
                                                <span className="dp-patient-deleted-date">
                                                    Dihapus: {new Date(pasien.deleted_at).toLocaleDateString('id-ID')}
                                                </span>
                                            </div>
                                            <div className="dp-patient-actions">
                                                <button
                                                    className="dp-btn-restore"
                                                    onClick={() => handleRestore(pasien.id_pasien)}
                                                    title="Pulihkan (Restore)"
                                                    style={{
                                                        backgroundColor: '#4CAF50',
                                                        border: 'none',
                                                        borderRadius: '5px',
                                                        padding: '5px 10px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="1 4 1 10 7 10"></polyline>
                                                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="dp-empty">Tidak ada data sampah</div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default DataSampah;
