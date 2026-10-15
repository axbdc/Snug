/**
 * Reduz e comprime uma foto para caber num documento do Firestore (limite 1 MB).
 * Devolve um data URL JPEG.
 */
export async function comprimirFoto(ficheiro: File, lado = 1280): Promise<string> {
  const url = URL.createObjectURL(ficheiro);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    let tamanho = lado;
    let qualidade = 0.78;
    for (let tentativa = 0; tentativa < 6; tentativa++) {
      const escala = Math.min(1, tamanho / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dados = canvas.toDataURL('image/jpeg', qualidade);
      if (dados.length < 750_000) return dados;
      tamanho = Math.round(tamanho * 0.82);
      qualidade = Math.max(0.55, qualidade - 0.06);
    }
    throw new Error('Foto demasiado grande');
  } finally {
    URL.revokeObjectURL(url);
  }
}
