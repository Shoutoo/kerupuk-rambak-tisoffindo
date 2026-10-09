import React from 'react';
import { motion } from 'motion/react';
import { Sun, Flame, Sparkles, CheckCircle, ShieldCheck, Factory, Award } from 'lucide-react';
import { APP_ASSETS } from '../../assets/images';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, imageReveal, viewportOnce } from '../../utils/motionVariants';

export const AboutSection: React.FC = () => {
  return (
    <section id="tentang" style={{ backgroundColor: '#FAF7F2', fontFamily: 'Urbanist, sans-serif' }} className="py-20 border-b border-[#E0D6CA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          variants={staggerContainer(0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.div
            variants={staggerItem}
            style={{ backgroundColor: '#EDE3D6', color: '#3A2618', borderColor: '#E0D6CA' }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold tracking-wide uppercase mb-3"
          >
            <Award className="w-3.5 h-3.5" style={{ color: '#A8441A' }} />
            Tentang Tisoffindo
          </motion.div>
          <motion.h2 variants={staggerItem} style={{ color: '#1C1917', fontFamily: 'Urbanist, sans-serif' }} className="text-3xl sm:text-4xl font-bold tracking-tight">
            Menjaga Keaslian Rasa, Menghadirkan Kerenyahan Terbaik dari Boyolali
          </motion.h2>
          <motion.p variants={staggerItem} style={{ color: '#5C554F' }} className="mt-4 text-base leading-relaxed">
            Berawal dari sentra pengolahan kulit sapi tradisional di Kliwonan, Jeron, Kec. Nogosari, Kabupaten Boyolali, Jawa Tengah, Tisoffindo tumbuh menjadi produsen kerupuk rambak terpercaya yang memadukan resep bumbu rempah warisan dengan standar kebersihan modern.
          </motion.p>
        </motion.div>

        {/* 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Images Grid */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer(0.2)}
          >
            <motion.div variants={fadeInLeft} className="space-y-4">
              <motion.div
                className="rounded-[24px] overflow-hidden shadow-md aspect-4/5 bg-stone-200 border border-[#E0D6CA]"
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <img
                  src={APP_ASSETS.krecekMentah}
                  alt="Penjemuran Krecek Kulit Sapi Alami Boyolali"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <motion.div variants={staggerItem} style={{ backgroundColor: '#F4EFE9', borderColor: '#E0D6CA' }} className="p-4 rounded-[20px] border">
                <h4 style={{ color: '#3A2618' }} className="font-bold text-sm">Penjemuran Alami</h4>
                <p style={{ color: '#5C554F' }} className="text-xs mt-1 leading-relaxed">
                  Krecek dijemur di bawah terik matahari murni tanpa oven kimia agar mekar maksimal saat digoreng.
                </p>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeInRight} className="space-y-4 pt-8">
              <motion.div variants={staggerItem} style={{ backgroundColor: '#2C221E', borderColor: '#3E302A' }} className="p-4 rounded-[20px] border shadow-md">
                <h4 style={{ color: '#F2A054' }} className="font-bold text-sm">Penggorengan 2 Tahap</h4>
                <p style={{ color: '#D6CECE' }} className="text-xs mt-1 leading-relaxed">
                  Minyak hangat untuk melunakkan serat kulit, lalu minyak panas untuk mengembangkan rongga renyah.
                </p>
              </motion.div>
              <motion.div
                className="rounded-[24px] overflow-hidden shadow-md aspect-4/5 bg-stone-200 border border-[#E0D6CA]"
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <img
                  src={APP_ASSETS.rambakStacks}
                  alt="Stok Kemasan Kerupuk Rambak Tisoffindo Siap Santap"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Text & Value Pillars */}
          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer(0.12)}
          >
            <motion.h3 variants={staggerItem} style={{ color: '#1C1917', fontFamily: 'Urbanist, sans-serif' }} className="text-2xl font-bold">
              Mengapa Pelanggan Memilih Kerupuk Rambak Tisoffindo?
            </motion.h3>
            <motion.p variants={staggerItem} style={{ color: '#5C554F' }} className="leading-relaxed">
              Kami menyadari banyak kerupuk rambak di pasaran yang dicampur tepung berlebih atau memakai zat pemutih sintetis. Tisoffindo berkomitmen menghadirkan <strong style={{ color: '#1C1917' }}>100% murni kulit sapi dan kerbau pilihan</strong> tanpa bahan berbahaya, sehingga aman dikonsumsi oleh seluruh anggota keluarga.
            </motion.p>

            <div className="space-y-4 pt-2">
              {[
                {
                  icon: <ShieldCheck className="w-5 h-5" />,
                  title: 'Bahan Baku Kulit Segar & Halal',
                  desc: 'Dipasok langsung dari rumah potong hewan terverifikasi halal dan higienis tanpa campuran kulit sisa tak layak.',
                },
                {
                  icon: <Sun className="w-5 h-5" />,
                  title: 'Bumbu Rempah Alami Khas Tradisi',
                  desc: 'Menggunakan bawang putih asli, ketumbar pilihan, garam laut, dan rempah Nusantara yang gurih meresap sampai ke serat terdalam.',
                },
                {
                  icon: <Flame className="w-5 h-5" />,
                  title: 'Renyah Tahan Lama & Tidak Berminyak',
                  desc: 'Melalui proses penirisan sentrifugal modern sehingga minim minyak dan tidak meninggalkan rasa gatal di tenggorokan.',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  variants={staggerItem}
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E0D6CA' }}
                  className="flex gap-4 p-4 rounded-2xl border shadow-xs hover:border-[#F2A054] transition-colors"
                  whileHover={{ x: 8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <div style={{ backgroundColor: '#EDE3D6', color: '#A8441A' }} className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 style={{ color: '#1C1917' }} className="text-sm font-bold">{item.title}</h4>
                    <p style={{ color: '#5C554F' }} className="text-xs mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
