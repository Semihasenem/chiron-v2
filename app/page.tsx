'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Brain,
  Heart,
  Sparkles,
  ShieldCheck,
  Activity,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <main className="min-h-screen bg-sage-50 text-slate-800 font-sans selection:bg-lavender-500 selection:text-white overflow-x-hidden">

      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center z-10">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-sage-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-lavender-500/10 rounded-full blur-[120px] animate-pulse" />
        </div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-4xl mx-auto space-y-8"
        >
          <motion.div variants={fadeIn} className="flex justify-center">
            <Image
              src="/images/chiron_logo.png"
              alt="Chiron Logo"
              width={200}
              height={200}
              className="object-contain mix-blend-multiply opacity-90"
              priority
            />
          </motion.div>
          <motion.h1
            variants={fadeIn}
            className="text-5xl md:text-7xl font-light tracking-tight text-sage-800"
          >
            Ruhsal iyi oluş,<br />
            <span className="font-medium">kendini bilmekle</span> başlar.
          </motion.h1>

          <motion.h2
            variants={fadeIn}
            className="text-xl md:text-2xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed"
          >
            Peki, değerlerinle davranışların aynı dili konuşuyor mu?
            Bu içsel uyumu keşfetmek ve güçlendirmek için <span className="text-sage-500 font-semibold">CHIRON</span> yanında.
          </motion.h2>

          <motion.div variants={fadeIn} className="pt-8">
            <Link
              href="/info"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-sage-800 text-white rounded-full text-lg font-medium transition-all duration-300 hover:bg-sage-500 hover:shadow-lg hover:shadow-sage-500/20 active:scale-95"
            >
              Araştırmaya Katıl
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-slate-400 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* 2. SECTION: "NEDEN BURADA?" (Mission) */}
      <section className="py-24 px-6 relative">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white/50 backdrop-blur-sm p-12 rounded-3xl shadow-xl shadow-sage-500/5 text-center border border-white"
          >
            <h3 className="text-sm font-bold tracking-widest text-sage-500 uppercase mb-4">Neden Burada?</h3>
            <p className="text-2xl md:text-3xl font-light text-slate-700 leading-relaxed">
              "Psikolojik iyi oluş bir lüks değil, ihtiyaçtır.
              <br /><br />
              <span className="font-normal text-sage-800">Chiron</span>, sosyal önyargılardan uzak, 7/24 ulaşabileceğin dijital bir pusuladır."
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. SECTION: "ÖZELLİKLER" (Methodology Grid) */}
      <section className="py-24 px-6 bg-sage-100/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-sage-800">Bilimsel Temellerimiz</h2>
            <div className="w-20 h-1 bg-lavender-500 mx-auto mt-6 rounded-full" />
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { icon: Brain, title: "BDT", desc: "Bilişsel Davranışçı Terapiler" },
              { icon: ShieldCheck, title: "ACT", desc: "Kabul ve Kararlılık" },
              { icon: Sparkles, title: "Mindfulness", desc: "Bilinçli Farkındalık" },
              { icon: Heart, title: "IFS", desc: "İçsel Aile Sistemleri" },
              { icon: Activity, title: "Somatik", desc: "Somatik Farkındalık" },
              { icon: Zap, title: "Alışkanlıklar", desc: "Atomik Alışkanlıklar" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeIn}
                className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-transparent hover:border-sage-100"
              >
                <div className="w-12 h-12 bg-sage-50 rounded-xl flex items-center justify-center text-sage-500 mb-6 group-hover:bg-sage-500 group-hover:text-white transition-colors duration-300">
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-medium text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. SECTION: "NASIL İŞLER?" (The Journey) */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-light text-sage-800">Nasıl İşler?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-sage-200 via-lavender-300 to-sage-200 -z-10" />

            {[
              { step: "01", title: "Anlat", desc: "İçinden geçenleri yargılanmadan dök." },
              { step: "02", title: "Keşfet", desc: "Akıllı rehberinle derinleş." },
              { step: "03", title: "Uygula & Geliş", desc: "İçgörünü hayata taşı." }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="flex flex-col items-center text-center bg-white md:bg-transparent p-6 md:p-0 rounded-2xl shadow-sm md:shadow-none"
              >
                <div className="w-24 h-24 bg-white rounded-full border-4 border-sage-50 shadow-lg flex items-center justify-center mb-6 relative z-10">
                  <span className="text-2xl font-bold text-lavender-500">{item.step}</span>
                </div>
                <h3 className="text-2xl font-medium text-sage-800 mb-3">{item.title}</h3>
                <p className="text-slate-500 max-w-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-sage-800 text-sage-100 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">

          <div className="space-y-4">
            <h4 className="text-2xl font-light tracking-widest text-white">CHIRON</h4>
            <p className="text-sm text-sage-300">İçsel yolculuğundaki dijital rehberin.</p>
          </div>

          <div className="bg-sage-900/50 p-6 rounded-xl border border-sage-700/50">
            <p className="font-bold text-white mb-2">UYARI</p>
            <p className="text-xs text-sage-300 leading-relaxed max-w-2xl mx-auto">
              Buradaki rehber bir doktor veya terapist değildir; içgörü sunan dijital bir destekçidir.
              Kriz durumunda lütfen 112'yi arayın veya bir sağlık kuruluşuna başvurun.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-sage-400">
            <Link href="#" className="hover:text-white transition-colors">Gizlilik Politikası (KVKK)</Link>
            <span className="hidden md:inline">•</span>
            <span className="text-lavender-500">18 yaşından küçükler için uygun değildir.</span>
            <span className="hidden md:inline">•</span>
            <Link href="mailto:iletisim@chiron.com.tr" className="hover:text-white transition-colors">Bize Yazın</Link>
          </div>

          <div className="pt-8 border-t border-sage-700/30 text-xs text-sage-500">
            &copy; {new Date().getFullYear()} Chiron. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </main>
  );
}
