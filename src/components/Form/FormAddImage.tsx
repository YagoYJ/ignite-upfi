import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { Box, Button, Stack, useToast } from '@chakra-ui/react';

import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

import { api } from '../../services/api';
interface FormAddImageProps {
  closeModal: () => void;
}

interface FormValues {
  url: string;
  title: string;
  description: string;
}

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const formValidations = {
    image: {
      required: 'Arquivo obrigatório',
      validate: {
        lessThan10MB: value =>
          value[0].size < 10485760 || 'O arquivo deve ser menor que 10MB',
        acceptedFormats: value =>
          /image\/(jpeg|png|gif)/.test(value[0].type) ||
          'Somente são aceitos arquivos PNG, JPEG e GIF',
      },
    },
    title: {
      required: 'Título obrigatório',
      minLenght: {
        message: 'Mínimo de 2 caracteres',
        value: 2,
      },
      maxLenght: {
        message: 'Máximo de 20 caracteres',
        value: 20,
      },
    },
    description: {
      required: 'Descrição obrigatória',
      maxLenght: {
        message: 'Máximo de 65 caracteres',
        value: 65,
      },
    },
  };

  const queryClient = useQueryClient();
  const mutation = useMutation<void, unknown, FormValues, unknown>(
    async formData => {
      await api.post('/api/images', formData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('images');
      },
    }
  );
  const { register, handleSubmit, reset, formState, setError, trigger } =
    useForm();
  const { errors } = formState;

  const onSubmit = async (data: Record<string, string>): Promise<void> => {
    try {
      if (!imageUrl) {
        toast({
          title: 'Imagem não adicionada',
          description:
            'É preciso adicionar e aguardar o upload de uma imagem antes de realizar o cadastro.',
          status: 'error',
        });
        return;
      }

      await mutation.mutateAsync({
        title: data.title,
        description: data.description,
        url: imageUrl,
      });

      toast({
        title: 'Imagem cadastrada',
        description: 'Sua imagem foi cadastrada com sucesso.',
        status: 'success',
      });
    } catch {
      toast({
        title: 'Falha no cadastro',
        description: 'Ocorreu um erro ao tentar cadastrar a sua imagem.',
        status: 'error',
      });
    } finally {
      reset();
      setImageUrl('');
      setLocalImageUrl('');
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          {...register('image', formValidations.image)}
          localImageUrl={localImageUrl}
          error={errors.image}
          setError={setError}
          trigger={trigger}
          setImageUrl={setImageUrl}
          setLocalImageUrl={setLocalImageUrl}
        />

        <TextInput
          {...register('title', formValidations.title)}
          placeholder="Título da imagem..."
          error={errors.title}
        />

        <TextInput
          {...register('description', formValidations.description)}
          placeholder="Descrição da imagem..."
          error={errors.description}
        />
      </Stack>

      <Button
        w="100%"
        my={6}
        py={6}
        type="submit"
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
      >
        Enviar
      </Button>
    </Box>
  );
}
