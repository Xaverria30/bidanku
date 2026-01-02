import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css';
import './LandingPage.css'; // Find a way to share styles or import them

import navbarLogo from '../../assets/images/navbar-pink-logo.png';

import iconVisi from '../../assets/images/icons/icon-visi.png';
import iconMisi from '../../assets/images/icons/icon-misi.png';

import iconServiceKehamilan from '../../assets/images/icons/icon-service-kehamilan.png';
import iconServicePersalinan from '../../assets/images/icons/icon-service-persalinan.png';
import iconServiceNifas from '../../assets/images/icons/icon-service-nifas.png';
import iconServiceKB from '../../assets/images/icons/icon-service-kb.png';
import iconServiceImunisasi from '../../assets/images/icons/icon-service-imunisasi.png';
import iconServiceKesehatan from '../../assets/images/icons/icon-service-kesehatan.png';

const AboutPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* Header/Navigation */}
            <header className="landing-header">
                <div className="header-container">
                    <div className="logo-section" onClick={() => navigate('/beranda')}>
                        <div className="header-logo-wrapper">
                            <img src={navbarLogo} alt="Logo" />
                        </div>
                        <div className="logo-details">
                            <h1 className="logo-text">Rumah Muaffa Bidan Yeye</h1>
                            <p className="logo-subtitle">SISTEM INFORMASI BIDAN DIGITAL</p>
                        </div>
                    </div>
                    <nav className="nav-menu">
                        <button
                            className="nav-link"
                            style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
                            onClick={() => navigate('/beranda')}
                        >
                            Beranda
                        </button>
                        <button
                            className="nav-link active"
                            style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
                            onClick={() => navigate('/tentang')}
                        >
                            Tentang
                        </button>
                        <button
                            className="btn-masuk"
                            onClick={() => navigate('/masuk')}
                        >
                            Masuk
                        </button>
                    </nav>
                </div>
            </header>

            {/* About Section */}
            <section className="about-page-content" id="tentang">
                <div className="about-container">
                    <div className="about-header">
                        <h2 className="about-title">Tentang Rumah Muaffa Bidan Yeye</h2>
                        <p className="about-subtitle">
                            Rumah Muaffa Bidan Yeye hadir untuk berdedikasi memberikan pelayanan kesehatan
                            Ibu dan Anak dengan penuh kasih sayang dan profesionalisme
                        </p>
                    </div>

                    {/* Visi Misi */}
                    <div className="visi-misi-grid">
                        <div className="visi-card">
                            <div className="visi-icon-wrapper">
                                <img src={iconVisi} alt="Visi" className="visi-icon-img" />
                            </div>
                            <h3 className="card-title">Visi</h3>
                            <p className="card-description">
                                Menjadi klinik bidan terpercaya yang memberikan pelayanan
                                kesehatan Ibu dan Anak berkualitas tinggi dengan pendekatan yang
                                humanis dan profesional.
                            </p>
                        </div>

                        <div className="misi-card">
                            <div className="misi-icon-wrapper">
                                <img src={iconMisi} alt="Misi" className="misi-icon-img" />
                            </div>
                            <h3 className="card-title">Misi</h3>
                            <p className="card-description">
                                Memberikan pelayanan kesehatan yang berkualitas, aman, dan
                                terpercaya kepada setiap Ibu dan Bayi dengan didukung oleh
                                tenaga bidan yang kompeten dan berpengalaman.
                            </p>
                        </div>
                    </div>



                    {/* Layanan Kami */}
                    <div className="services-section">
                        <h2 className="services-title">Layanan Kami</h2>
                        <div className="services-grid">
                            <div className="service-item">
                                <div className="service-icon-bg pink-light">
                                    <img src={iconServiceKehamilan} alt="Kehamilan" className="service-icon-img" />
                                </div>
                                <div className="service-content">
                                    <h4>Pemeriksaan Kehamilan</h4>
                                    <p>Pemeriksaan rutin kesehatan ibu hamil dan janin</p>
                                </div>
                            </div>

                            <div className="service-item">
                                <div className="service-icon-bg pink-light">
                                    <img src={iconServicePersalinan} alt="Persalinan" className="service-icon-img" />
                                </div>
                                <div className="service-content">
                                    <h4>Persalinan Normal</h4>
                                    <p>Pendampingan persalinan dengan tenaga profesional</p>
                                </div>
                            </div>

                            <div className="service-item">
                                <div className="service-icon-bg pink-light">
                                    <img src={iconServiceNifas} alt="Nifas" className="service-icon-img" />
                                </div>
                                <div className="service-content">
                                    <h4>Perawatan Nifas</h4>
                                    <p>Perawatan pasca melahirkan untuk ibu dan bayi</p>
                                </div>
                            </div>

                            <div className="service-item">
                                <div className="service-icon-bg pink-light">
                                    <img src={iconServiceKB} alt="KB" className="service-icon-img" />
                                </div>
                                <div className="service-content">
                                    <h4>Konsultasi KB</h4>
                                    <p>Konsultasi dan pelayanan keluarga berencana</p>
                                </div>
                            </div>

                            <div className="service-item">
                                <div className="service-icon-bg pink-light">
                                    <img src={iconServiceImunisasi} alt="Imunisasi" className="service-icon-img" />
                                </div>
                                <div className="service-content">
                                    <h4>Imunisasi Bayi</h4>
                                    <p>Program imunisasi lengkap untuk bayi</p>
                                </div>
                            </div>

                            <div className="service-item">
                                <div className="service-icon-bg pink-light">
                                    <img src={iconServiceKesehatan} alt="Kesehatan" className="service-icon-img" />
                                </div>
                                <div className="service-content">
                                    <h4>Konsultasi Kesehatan</h4>
                                    <p>Monitoring kesehatan Ibu dan Anak</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Jadwal Praktik */}
                    <div className="schedule-section">
                        <h2 className="schedule-title">Jadwal Praktik</h2>
                        <div className="schedule-grid">
                            <div className="schedule-card">
                                <h3>Pemeriksaan Kehamilan</h3>
                                <p className="days">Senin - Sabtu</p>
                                <p>07.00 - 12.00 WIB</p>
                                <p>14.00 - 20.00 WIB</p>
                            </div>

                            <div className="schedule-card">
                                <h3>Konsultasi Kesehatan</h3>
                                <p className="days">Senin - Sabtu</p>
                                <p>07.00 - 12.00 WIB</p>
                                <p>14.00 - 20.00 WIB</p>
                            </div>

                            <div className="schedule-card">
                                <h3>Program KB</h3>
                                <p className="days">Senin - Sabtu</p>
                                <p>07.00 - 12.00 WIB</p>
                                <p>14.00 - 20.00 WIB</p>
                            </div>

                            <div className="schedule-card">
                                <h3>Persalinan</h3>
                                <p className="xx-large">24 Jam</p>
                            </div>

                            <div className="schedule-card">
                                <h3>Imunisasi</h3>
                                <p className="days">Selasa & Sabtu</p>
                                <p>08.00 - 11.00 WIB</p>
                                <p className="note">*Daftar terlebih dahulu</p>
                            </div>

                            <div className="schedule-card">
                                <h3>Perawatan Nifas</h3>
                                <p className="xx-large">24 Jam</p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>© 2015 Klinik Bidan Yeye | Sistem Informasi Manajemen Klinik</p>
                <p>Platform digital untuk pengelolaan data pasien dan pelayanan klinik</p>
            </footer>
        </div>
    );
};

export default AboutPage;
