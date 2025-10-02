# -*- coding: utf-8 -*-
"""
BERT Disaster Classification (local version, VS Code)
"""

import torch
import pandas as pd
import numpy as np
from transformers import BertTokenizer, BertForSequenceClassification
from torch.optim import AdamW
from torch.nn import CrossEntropyLoss
from torch.utils.data import TensorDataset, DataLoader, RandomSampler, SequentialSampler
from sklearn.model_selection import train_test_split

# ----------------------------
# 1. Load dataset
# ----------------------------
df = pd.read_csv("train.csv")  # make sure train.csv is in same folder
print(df.head())

# ----------------------------
# 2. Tokenizer
# ----------------------------
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

sample_text = df['text'][0]
encoding = tokenizer.encode_plus(
    sample_text,
    add_special_tokens=True,
    max_length=64,
    padding='max_length',
    truncation=True,
    return_attention_mask=True,
    return_tensors='pt'
)

print("Original Tweet:", sample_text)
print("Token IDs:", encoding['input_ids'])
print("Attention Mask:", encoding['attention_mask'])

# ----------------------------
# 3. Train/Validation Split
# ----------------------------
train_texts, val_texts, train_labels, val_labels = train_test_split(
    df['text'].values,
    df['target'].values,
    test_size=0.2,
    random_state=42
)

train_encodings = tokenizer(list(train_texts), truncation=True, padding=True, max_length=64)
val_encodings   = tokenizer(list(val_texts), truncation=True, padding=True, max_length=64)

train_inputs = torch.tensor(train_encodings['input_ids'])
train_masks  = torch.tensor(train_encodings['attention_mask'])
train_labels = torch.tensor(train_labels)

val_inputs   = torch.tensor(val_encodings['input_ids'])
val_masks    = torch.tensor(val_encodings['attention_mask'])
val_labels   = torch.tensor(val_labels)

print("Train shape:", train_inputs.shape)
print("Validation shape:", val_inputs.shape)

# ----------------------------
# 4. DataLoaders
# ----------------------------
train_dataset = TensorDataset(train_inputs, train_masks, train_labels)
val_dataset   = TensorDataset(val_inputs, val_masks, val_labels)

batch_size = 16

train_dataloader = DataLoader(train_dataset, sampler=RandomSampler(train_dataset), batch_size=batch_size)
validation_dataloader = DataLoader(val_dataset, sampler=SequentialSampler(val_dataset), batch_size=batch_size)

# ----------------------------
# 5. Load BERT model
# ----------------------------
num_labels = 2
model = BertForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=num_labels)

device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')
model.to(device)
print("Model loaded on device:", device)

optimizer = AdamW(model.parameters(), lr=2e-5)

# ----------------------------
# 6. Training Loop
# ----------------------------
def flat_accuracy(preds, labels):
    pred_flat = np.argmax(preds, axis=1).flatten()
    labels_flat = labels.flatten()
    return np.sum(pred_flat == labels_flat) / len(labels_flat)

epochs = 3

for epoch in range(epochs):
    print(f"\n======== Epoch {epoch + 1} / {epochs} ========")

    # Training
    model.train()
    total_loss = 0
    for step, batch in enumerate(train_dataloader):
        input_ids, attention_masks, labels = [b.to(device) for b in batch]

        optimizer.zero_grad()
        outputs = model(input_ids, attention_mask=attention_masks, labels=labels)
        loss = outputs.loss
        logits = outputs.logits

        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        if step % 50 == 0:
            print(f"Step {step}, Loss: {loss.item():.4f}")

    avg_train_loss = total_loss / len(train_dataloader)
    print(f"Average training loss: {avg_train_loss:.4f}")

    # Validation
    model.eval()
    eval_accuracy = 0
    nb_eval_steps = 0

    for batch in validation_dataloader:
        input_ids, attention_masks, labels = [b.to(device) for b in batch]

        with torch.no_grad():
            outputs = model(input_ids, attention_mask=attention_masks)
            logits = outputs.logits

        logits = logits.detach().cpu().numpy()
        label_ids = labels.to('cpu').numpy()
        eval_accuracy += flat_accuracy(logits, label_ids)
        nb_eval_steps += 1

    print(f"Validation Accuracy: {eval_accuracy / nb_eval_steps:.4f}")

# ----------------------------
# 7. Save Model & Tokenizer
# ----------------------------
model.save_pretrained("disaster_bert_model")
tokenizer.save_pretrained("disaster_bert_model")

# ----------------------------
# 8. Testing with new tweets
# ----------------------------
tweets = [
    "Breaking news: Earthquake tremors felt in downtown Tokyo.",
    "Can’t believe how amazing the concert was last night!",
    "Severe flooding reported near the river banks. Evacuation ongoing.",
    "I’m so excited for the new movie release tomorrow!",
    "Wildfire spreads rapidly in California, residents warned to evacuate."
]

for tweet in tweets:
    encoding = tokenizer.encode_plus(
        tweet,
        add_special_tokens=True,
        max_length=64,
        padding='max_length',
        truncation=True,
        return_attention_mask=True,
        return_tensors='pt'
    )
    input_ids = encoding['input_ids'].to(device)
    attention_mask = encoding['attention_mask'].to(device)

    with torch.no_grad():
        outputs = model(input_ids, attention_mask=attention_mask)
        logits = outputs.logits

    probs = torch.softmax(logits, dim=1)
    predicted_class = torch.argmax(probs, dim=1).item()

    if predicted_class == 1:
        print(f"🚨 ALERT: Disaster detected! Tweet: {tweet}")
        print(f"Disaster Probability: {probs[0][1].item():.3f}")
    else:
        print(f"Tweet OK: {tweet}")
    print("-" * 80)
