import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';

export async function POST(request) {
    try {
        const fraudData = await request.json();

        // Validation des données requises
        if (!fraudData.id_ref) {
            return NextResponse.json(
                { success: false, message: 'ID étudiant manquant' },
                { status: 400 }
            );
        }

        // Référence au document de fraude pour cet étudiant
        const fraudRef = doc(db, 'fraude', fraudData.id_ref);

        try {
            // Vérifier si une fraude existe déjà pour cet étudiant
            const fraudDoc = await getDoc(fraudRef);

            if (fraudDoc.exists()) {
                // Mettre à jour le document existant
                await updateDoc(fraudRef, {
                    nombre_fraude: increment(1),
                    details: arrayUnion({
                        date: fraudData.date_fraude,
                        type: fraudData.type_fraude,
                        details: fraudData.details
                    }),
                    multiple_persons_detected: fraudData.multiple_persons_detected,
                    position_violations: fraudData.position_violations,
                    speech_detections: fraudData.speech_detections,
                    ref_type: fraudData.ref_type,
                    last_updated: new Date().toISOString()
                });
            } else {
                // Créer un nouveau document
                await setDoc(fraudRef, {
                    ...fraudData,
                    details: [{
                        date: fraudData.date_fraude,
                        type: fraudData.type_fraude,
                        details: fraudData.details
                    }],
                    created_at: new Date().toISOString(),
                    last_updated: new Date().toISOString()
                });
            }

            return NextResponse.json({ 
                success: true, 
                message: 'Fraude signalée avec succès',
                data: {
                    id_ref: fraudData.id_ref,
                    type: fraudData.type_fraude
                }
            });

        } catch (firebaseError) {
            console.error('Erreur Firebase:', firebaseError);
            return NextResponse.json(
                { 
                    success: false, 
                    message: 'Erreur lors de l\'interaction avec la base de données',
                    error: firebaseError.message 
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Erreur lors du traitement de la fraude:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Erreur lors du traitement de la fraude',
                error: error.message 
            },
            { status: 500 }
        );
    }
} 