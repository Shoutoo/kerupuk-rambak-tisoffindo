import React from 'react';
import { Sun, Flame, Sparkles, CheckCircle, ShieldCheck, Factory, Award } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="tentang" className="py-20 bg-stone-100/70 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wide uppercase mb-3">
            <Award className="w-3.5 h-3.5 text-amber-700" />
            Tentang Tisoffindo
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 tracking-tight">
            Menjaga Keaslian Rasa, Menghadirkan Kerenyahan Terbaik dari Boyolali
          </h2>
          <p className="mt-4 text-base text-stone-600 leading-relaxed">
            Berawal dari sentra pengolahan kulit sapi tradisional di Kliwonan, Jeron, Kec. Nogosari, Kabupaten Boyolali, Jawa Tengah, Tisoffindo tumbuh menjadi produsen kerupuk rambak terpercaya yang memadukan resep bumbu rempah warisan dengan standar kebersihan modern.
          </p>
        </div>

        {/* 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Images Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-md aspect-4/5 bg-stone-200">
                <img
                  src="https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80"
                  alt="Penjemuran Krecek Kulit Sapi Alami"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/60">
                <h4 className="font-bold text-amber-950 text-sm">Penjemuran Alami</h4>
                <p className="text-xs text-amber-900/80 mt-1">
                  Krecek dijemur di bawah terik matahari murni tanpa oven kimia agar mekar maksimal saat digoreng.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="p-4 rounded-xl bg-stone-900 text-white shadow-md">
                <h4 className="font-bold text-amber-400 text-sm">Penggorengan 2 Tahap</h4>
                <p className="text-xs text-stone-300 mt-1">
                  Minyak hangat untuk melunakkan serat kulit, lalu minyak panas untuk mengembangkan rongga renyah.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-md aspect-4/5 bg-stone-200">
                <img
                  src="https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80"
                  alt="Kerupuk Rambak Matang Tisoffindo"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* Text & Value Pillars */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold font-serif text-stone-900">
              Mengapa Pelanggan Memilih Kerupuk Rambak Tisoffindo?
            </h3>
            <p className="text-stone-600 leading-relaxed">
              Kami menyadari banyak kerupuk rambak di pasaran yang dicampur tepung berlebih atau memakai zat pemutih sintetis. Tisoffindo berkomitmen menghadirkan <strong>100% murni kulit sapi dan kerbau pilihan</strong> tanpa bahan berbahaya, sehingga aman dikonsumsi oleh seluruh anggota keluarga.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-4 p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Bahan Baku Kulit Segar & Halal</h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Dipasok langsung dari rumah potong hewan terverifikasi halal dan higienis tanpa campuran kulit sisa tak layak.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Bumbu Rempah Alami Khas Tradisi</h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Menggunakan bawang putih asli, ketumbar pilihan, garam laut, dan rempah Nusantara yang gurih meresap sampai ke serat terdalam.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Renyah Tahan Lama & Tidak Berminyak</h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Melalui proses penirisan sentrifugal modern sehingga minim minyak dan tidak meninggalkan rasa gatal di tenggorokan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
